#!/usr/bin/env node
/**
 *`git pull` from the repo and branch that a PR originates from.
 * Copyright 2019 Matthew Brookes. License: MIT
 */

var https = require('https');
var execSync = require('child_process').execSync;
var fs = require('fs');

var version = 'git-pull-request 2.0.2';
var use = '\n ' + version + '\n\n gpr [-i | -l [-r] | -p | -f | -b [<name>] | -n | -d | -D | -v | -h] <pr#>';

var hint = ' By default, `gpr <pr#>` will fetch the remote branch for <pr#> and checkout on a detached HEAD.';

var usage = use + '\n\n' + hint + '\n\n gpr [-h | --help] for detailed usage.';
var help = use +

'\n\n [-i | info] <pr#>               Show the PR title and requestor for <pr#>.\n\
 [-l | ls | list] [-r | remote]  List local gpr branches. / List 30 most recent open PRs.\n\
\n\
 [-u | |update | pull] <pr#>     Pull the remote branch for <pr#> to the current branch.\n\
 [-f | force] <pr#>              Force overwrite the local branch and checkout on a detached HEAD.\n\
 [-b | branch] [<name>] <pr#>    Create new branch [name] from master and pull. Defaults to \'gpr/<pr#>\'.\n\
 [-n | named] <user:branch>      Fetch from the named ref and checkout on a detached HEAD.\n\
\n\
 [-p | push] <user:branch>       Push the current branch or detached HEAD to the remote branch.\n\
 [-P | Push] <<user:branch>      Force push the current branch or detached HEAD to the remote branch.\n\
\n\
 [-d | delete] <pr#>             Delete the gpr/<pr#> branch.\n\
 [-D | Delete] <pr#>             Force delete the gpr/<pr#> branch.\n\
\n\
 [-v | version]                  Show git-pull-request version.\n\
 [-h | help]                     This help.\n\
\n\
 <pr#>                           PR number to apply the command to.\n\n' + hint;


// Read the command-line args
var args = process.argv;

if (args.length < 3) {
  exit(usage);
}

// Exit with a message
function exit(error) {
  console.error(error,'\n');
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
}

function getNpmPrefix(){
  try {
    return execSync('npm prefix', {cwd: process.cwd(), encoding: 'utf8'}).replace(/\s+/g, '');
  } catch (error) {}
}

function getDetailsFromPackageJson(){
  var npmPrefix = getNpmPrefix();
  var packageFile = JSON.parse(fs.readFileSync(npmPrefix + '/package.json', 'utf8'));

  if(packageFile.repository && packageFile.repository.url){
    // repo: [ 'https:', '', 'github.com', 'mui-org', 'material-ui.git' ],
    var repo = packageFile.repository.url.split('/');

    // repoName: 'material-ui'
    var repoName = repo[4].slice(0, -4);

    // path: '/repos/mui-org/material-ui/pulls'
    var path = '/repos/' + repo[3]+ '/' + repoName + '/pulls';

    return { repoName, path };
  }

  return null;
}

function getGitPrefix(){
  try {
    return execSync('git rev-parse --show-toplevel', {cwd: process.cwd(), encoding: 'utf8'}).replace(/\s+/g, '');
  } catch (error) {
    exit(error.output[1]);
  }
}

function getDetailsFromGitConfig(){
  var gitPrefix = getGitPrefix();

  var gitConfig = fs.readFileSync(gitPrefix + '/.git/config', 'utf8');

  // repo: [ 'https:', '', 'github.com', 'mui-org', 'material-ui.git' ],
  var repo = gitConfig.match(/\[remote "upstream"\][\r\n|\r|\n]\s*url\s=\s(.*)/);

  if (!repo) {
    repo = gitConfig.match(/\[remote "origin"\][\r\n|\r|\n]\s*url\s=\s(.*)/);
    if (!repo) {
      exit('No "upstream" or "origin" remote found in .git/config')
    }
  }
  repo = repo[1].split('/');

  if(repo[0].includes('git@')){
    // repoName: 'material-ui'
    var repoName = repo[1].slice(0, -4);
    var namespace = repo[0].split(':')[1]

    // path: '/repos/mui-org/material-ui/pulls'
    var path = '/repos/' + namespace + '/' + repoName + '/pulls';
  } else {
    // repoName: 'material-ui'
    var repoName = repo[4].slice(0, -4);

    // path: '/repos/mui-org/material-ui/pulls'
    var path = '/repos/' + repo[3]+ '/' + repoName + '/pulls';
  }
  console.log("git without package")

  return { repoName, path };
}

var npmPrefix = getNpmPrefix();

// Read the package.json and extract the repo name
if (fs.existsSync(npmPrefix + '/package.json')) {
  var repoDetails = getDetailsFromPackageJson();

  if(!repoDetails){
    repoDetails = getDetailsFromGitConfig();
  }

  // If there's no package.json, try .git config upstream / origin
} else {
  var gitPrefix = getGitPrefix();

  if (fs.existsSync(gitPrefix + '/.git/config')) {
    var repoDetails = getDetailsFromGitConfig();
  } else {
    exit('No package.json or .git/config found in any ancestor directory')
  }
}

// Process args that don't require the API, or setup those that do
switch(args[2]) {
  case 'help': case '--help': case '-h':
    exit(help);

  case 'version': case '--version': case '-v':
    exit('\n' + version);

  case 'list': case 'ls': case '-l':
    if (args[3] === '-r' || args[3] === 'remote' || args[3] === 'pr' || args[3] === 'pr') {
      break;
    }
    execho('git branch --list gpr/*');
    process.exit();

  case '-n': case 'named':
    if (args.length < 4) {
      exit(usage);
    }

    ref = args[3].split(':');

    if (ref.length !== 2) {
      exit(usage);
    }

    execho('git fetch ' + 'https://github.com/' + ref[0] + '/' + repoDetails.repoName + ' "' + ref[1] + '"');
    execho('git checkout FETCH_HEAD');
    process.exit();

  case '-p': case 'push':
    if (args.length < 4) {
      exit(usage);
    }

    ref = args[3].split(':');

    if (ref.length !== 2) {
      exit(usage);
    }

    execho('git push ' + 'https://github.com/' + ref[0] + '/' + repoDetails.repoName + ' "' + 'HEAD:' + ref[1] + '"');
    process.exit();

  case '-P': case 'Push':
    if (args.length < 4) {
      exit(usage);
    }

    ref = args[3].split(':');

    if (ref.length !== 2) {
      exit(usage);
    }

    execho('git push -f ' + 'https://github.com/' + ref[0] + '/' + repoDetails.repoName + ' "' + 'HEAD:' + ref[1] + '"');
    process.exit();

  default:
    var prNumber = args[args.length - 1];
    if (~~prNumber === 0) { exit(usage + '\n\n <pr> must be a number.'); }

    repoDetails.path += '/' + prNumber;
}

// https options
var options = {
  hostname: 'api.github.com',
  port: 443,
  path: repoDetails.path,
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
        }
      }

      if (response.head.repo == null) {
        exit('\n Couldn\'t find source repo. It may have been deleted.');
      }
      var remote = response.head.repo.clone_url + ' "' + response.head.ref + '"';
    }

    // Colors
    var reset = '\x1b[0m', red = '\x1b[31m#', green = '\x1b[32m', yellow = '\x1b[33m',
      blue = "\x1b[34m", magenta = "\x1b[35m", cyan = '\x1b[36m';



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

      case 'update': case 'pull': case '-u':
        execho('git pull ' + remote);
        break;

      case 'delete': case '-d':
        execho('git checkout master');
        execho('git branch -d gpr/' + prNumber + ' master');
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
