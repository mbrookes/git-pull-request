#!/usr/local/bin/node

// `git pull` from the repo and branch that a PR originates from.

var https = require('https');
var execSync = require('child_process').execSync;
var fs = require('fs');

var usage = '\n gpr [-b | -i | -D] {pr}'
var help = usage +
    '\n\n -b: Create new branch off master with gpr prefix.\n' +
    ' -i: Show the PR title and requestor.' +
    ' -D: Force delete the branch created.\n' +
    ' {pr}: PR number to pull the remote branch for.';

// Exit with a message
function exit(error) {
  console.log(error,'\n')
  process.exit();
};

// Exec with echo
function execho(command) {
  console.log('\n', command);
  try {
    execSync(command, function puts(error, stdout, stderr) { console.log(stdout) });
  } catch (err) {
   //console.error(err);
  }
};

// Get the repo name from the package.jason in the neareast parent directory
var npmPrefix = execSync('npm prefix', {cwd: process.cwd(), encoding: 'utf8'}).replace(/\s+/g, '');

// Read the package.json and extract the repo name
var packageFile = JSON.parse(fs.readFileSync(npmPrefix + '/package.json', 'utf8'));
var repo = packageFile.repository.url.split('/')
repo = repo[3]+ '/' + repo[4].slice(0, -4)

// Read the command-line args
var args = process.argv;
if (args.length < 3) {
  exit(usage);
} else if (args[2] == '-h' || args[2] == '--help') {
 exit(help);
} else {
  var prNumber = args[args.length - 1];
  if (~~prNumber === 0) { exit(usage + '\n\n <pr> must be a number.'); };
};

var options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/repos/' + repo + '/pulls/' + prNumber,
  headers: {
    'User-Agent': 'git-pull'
  },
};

https.get(options, function(result) {
  var body = '';

  result.on('data', function(chunk) {
    body += chunk;
  });

  result.on('end', function() {
    var response = JSON.parse(body);

    if (typeof response.head === 'undefined') {
      exit('\n Couldn\'t find PR #' + prNumber)
    }

    if (args[2] === '-i') {
      console.log('\n' + response.title, '(@' + response.user.login + ')\n');
      process.exit();
    };

    if (args[2] === '-D') {
      execho('git checkout master');
      execho('git branch -D gpr/' + prNumber);
      process.exit();
    };

    if (args[2] === '-b') {
      execho('git checkout master');
      execho('git branch gpr/' + prNumber);
      execho('git checkout gpr/' + prNumber);
    }
    execho("git pull " + response.head.repo.clone_url + " " + response.head.ref);
  });

}).on('error', function(error) {
  console.log("Error: ", error);
});
