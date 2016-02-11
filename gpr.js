#!/usr/local/bin/node
/**
 *`git pull` from the repo and branch that a PR originates from.
 * Copyright 2016 Matthew Brookes. License: MIT
 */

var https = require('https');
var execSync = require('child_process').execSync;
var fs = require('fs');

var version = 'git-pull-request 0.2.2'
var usage = '\n gpr [-i | -l | -lsr | -p | -b <name> | -d | -D | -h | -v ] <pr#>'
var help = usage + '\n\n' +
' [-i | info]        Show the PR title and requestor for <pr#>.\n' +
' [-l | | ls | list] List local gpr branches.\n' +
' [-lsr | ls-remote] List 30 most recent open PRs.\n' +
' [-p | pull]        Pull the remote branch for <pr#> to the current branch.\n' +
' [-b | branch]      Create new branch <name> from master and pull. Defaults to \'gpr/<pr#>\'\n' +
' [-d | delete]      Delete the gpr/<pr#> branch.\n' +
' [-D | Delete]      Force delete the gpr/<pr#> branch.\n' +
' [-v | version]     git-pull-request version.\n' +
' [-h | help ]       This help.\n' +
' <pr#>              PR number to apply the command to.';

// Get the repo name from the package.jason in the neareast parent directory
var npmPrefix = execSync('npm prefix', {cwd: process.cwd(), encoding: 'utf8'}).replace(/\s+/g, '');

// Read the package.json and extract the repo name
var packageFile = JSON.parse(fs.readFileSync(npmPrefix + '/package.json', 'utf8'));
var repo = packageFile.repository.url.split('/')
repo = repo[3]+ '/' + repo[4].slice(0, -4)

// Read the command-line args
var args = process.argv;
// Process args that don't require the API, or setup those that do
if (args.length < 3) {
  exit(usage);
} else if (args[2] == '-h' || args[2] == '--help' || args[2] == 'help') {
  exit(help);
} else if (args[2] == '-v' || args[2] == '--version' || args[2] == 'version') {
  exit(version);
} else if (args[2] == '-l' || args[2] == 'ls' || args[2] == 'list') {
  execho('git branch --list gpr/*');
  process.exit();
} else if (args[2] == '-lsr' || args[2] == 'lsr' || args[2] == 'ls-remote') {
  var path = 'https://api.github.com/repos/callemall/material-ui/pulls'
} else {
  var prNumber = args[args.length - 1];
  if (~~prNumber === 0) { exit(usage + '\n\n <pr> must be a number.'); };
  var path = '/repos/' + repo + '/pulls/' + prNumber;
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
      }
      var pull = "git pull " + response.head.repo.clone_url + " " + response.head.ref;
      var branch = 'gpr/' + prNumber;
    };

    // Process args
    switch(args[2]) {
      case 'info': case '-i':
        console.log('\n' + response.title, '(@' + response.user.login + ')\n');
        break;

      case 'list-remote': case 'lsr': case '-lsr':
        console.log()
        response.forEach( function(pr) {
          console.log('#' + pr.number, pr.title, '(@' + pr.user.login + ')')
        });
        console.log()
        break;

      case 'pull': case '-p':
        execho(pull);
        break;

      case 'delete': case '-d':
        execho('git checkout master');
        execho('git branch -d gpr/' + prNumber);
        break;

      case 'Delete': case '-D':
        execho('git checkout master');
        execho('git branch -D gpr/' + prNumber);
        break;

      case 'branch': case '-b':
        branch = args[args.length - 2]
        // Fall through to default with new branch name

      default:
      execho('git checkout master');
      execho('git branch ' + branch);
      execho('git checkout ' + branch);
      execho(pull);
    }
  });

}).on('error', function(error) {
  console.log("Error: ", error);
});
