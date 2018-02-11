#!/usr/bin/env node
/**
 *`git pull` from the repo and branch that a PR originates from.
 * Copyright 2016 Matthew Brookes. License: MIT
 */

var https = require('https');
var execSync = require('child_process').execSync;
var fs = require('fs');

var version = 'git-pull-request 0.3.2';
var usage = '\n ' + version + '\n\n gpr [-i | -l [-r] | -p | -f | -b [<name>] | -n | -d | -D | -v | -h] <pr#>';
var help = usage + '\n\n' +
' By default, gpr will fetch the remote branch for <pr#> and checkout on a detached HEAD.\n\n' +

' [-i | info] <pr#>               Show the PR title and requestor for <pr#>.\n' +
' [-l | ls | list] [-r | remote]  List local gpr branches. / List 30 most recent open PRs.\n\n' +

' [-p | pull] <pr#>               Pull the remote branch for <pr#> to the current branch.\n' +
' [-f | force] <pr#>              Force overwrite the local branch and checkout on a detached HEAD.\n' +
' [-b | branch] [<name>] <pr#>      Create new branch [name] from master and pull. Defaults to \'gpr/<pr#>\'.\n' +
' [-n] [user:branch]              Fetch from the named ref and checkout on a detached HEAD.\n\n' +

' [-d | delete] <pr#>             Delete the gpr/<pr#> branch.\n' +
' [-D | Delete] <pr#>             Force delete the gpr/<pr#> branch.\n\n' +

' [-v | version]                  Show git-pull-request version.\n' +
' [-h | help]                     This help.\n\n' +

' <pr#>                           PR number to apply the command to.';

// Get the repo name from the package.jaon in the neareast parent directory
var npmPrefix = execSync('npm prefix', {cwd: process.cwd(), encoding: 'utf8'}).replace(/\s+/g, '');

// Read the package.json and extract the repo name
var packageFile = JSON.parse(fs.readFileSync(npmPrefix + '/package.json', 'utf8'));
var repo = packageFile.repository.url.split('/');
var repoName = repo[4].slice(0, -4);
repo = repo[3]+ '/' + repoName;
var path = '/repos/' + repo + '/pulls';

// Read the command-line args
var args = process.argv;

if (args.length < 3) {
  exit(usage);
}

// Exit with a message
function exit(error) {
  console.log(error,'\n')
  process.exit();
};

// Exec with echo
function execho(command) {
  console.log(command);
  try {
    console.log(execSync(command, {encoding: 'utf8'}));
  } catch (error) {
   console.error(error.output[1]);
  }
};

// Process args that don't require the API, or setup those that do
switch(args[2]) {
  case 'help': case '--help': case '-h':
    exit(help);

  case 'version': case '--version': case '-v':
    exit('\n' + version);

  case 'list': case 'ls': case '-l':
    if (args[3] == '-r' || args[3] == 'remote' || args[3] == 'pr' || args[3] == 'pr') {
        break;
    }
    execho('git branch --list gpr/*');
    process.exit();

  // Unlisted old usage - possibly deprecate, maybe keep for cool kids.
  case 'ls-remote': case 'lsr': case '-r':
    break;

  case '-n':
    if (args.length < 4) {
      exit(usage);
    };

    ref = args[3].split(':');

    if (ref.length !== 2) {
      exit(usage);
    };

    execho('git fetch ' + 'https://github.com/' + ref[0] + '/' + repoName + ' \'' + ref[1] + '\'');
    execho('git checkout FETCH_HEAD');
    process.exit();

  default:
    var prNumber = args[args.length - 1];
    if (~~prNumber === 0) { exit(usage + '\n\n <pr> must be a number.'); };
    var path = path + '/' + prNumber;
};

// https options
var options = {
  hostname: 'api.github.com',
  port: 443,
  path: path,
  headers: {
    'User-Agent': version
  },
};

// Read from the API
https.get(options, function(result) {
  var body = '';

  // Read the data
  result.on('data', function(chunk) {
    body += chunk;
  });

  // Parse the result
  result.on('end', function() {
    var response = JSON.parse(body);

    // If we're not getting the PR list [array], expect a response.head
    if (typeof response[0] === 'undefined') {
      if (typeof response.head === 'undefined') {
        if (typeof prNumber !== 'undefined') {
          exit('\n Couldn\'t find PR #' + prNumber);
        } else {
          exit('\n Couldn\'t read data.');
        };
      };

      if (response.head.repo == null) {
        exit('\n Couldn\'t find source repo. It may have been deleted.');
      };
      var remote = response.head.repo.clone_url + ' \'' + response.head.ref + '\'';
    };

    // Colors
    var reset = '\x1b[0m', red = '\x1b[31m#', green = '\x1b[32m', yellow = '\x1b[33m',
    blue = "\x1b[34m", magenta = "\x1b[35m", cyan = '\x1b[36m'



    function displayPr(pr) {
      // Color [bracketed] string
      pr.title = pr.title.replace('[', cyan + '[');
      pr.title = pr.title.replace(']', ']' + reset);
      console.log(red + pr.number + reset, pr.title, green + '(@' + pr.user.login + ')' + reset);
    };

    // Process args
    switch(args[2]) {
      case 'info': case '-i':
        console.log();
        displayPr(response);
        console.log();
        break;

      case 'list': case 'ls': case '-l':
        console.log();
        response.forEach( function(pr) {
          displayPr(pr);
        });
        console.log();
        break;

      case 'pull': case '-p':
        execho('git pull ' + remote);
        break;

      case 'delete': case '-d':
        execho('git checkout master');
        execho('git branch -d gpr/' + prNumber) + ' master';
        break;

      case 'Delete': case '-D':
        execho('git checkout master');
        execho('git branch -D gpr/' + prNumber);
        break;

      case 'branch': case '-b':
        if (args.length === 5) {
          var branch = args[3]
        } else {
          var branch = 'gpr/' + prNumber;
        }
        execho('git checkout -B ' + branch + ' master');
        execho('pull ' + remote);
        break;

      case 'force': case '-f':
        execho('git fetch -f ' + remote);
        execho('git checkout FETCH_HEAD');
        break;

      default:
        execho('git fetch ' + remote);
        execho('git checkout FETCH_HEAD');
    }
  });

}).on('error', function(error) {
  console.log("Error: ", error);
});
