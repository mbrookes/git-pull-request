#!/usr/local/bin/node

// `git pull` from the repo and branch that a PR originates from.

var https = require('https');
var execSync = require('child_process').execSync;
var fs = require('fs');

var usage = '\n gpr [-i | pull | -b {branch-name} | -d | -D] {PR#}'
var help = usage + '\n\n' +
    ' -i    Show the PR title and requestor.\n' +
    ' pull  Pull the remote branch for {PR#} to the current branch.\n' +
    ' -b    Create new branch {branch-name} from master. Defaults to \'grp/{PR#}\'\n' +
    ' -d    Delete the gpr/{PR#} branch.\n' +
    ' -D    Force delete the gpr/{PR#} branch.\n' +
    ' {PR#} PR number to apply the command to.';

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

    pull = "git pull " + response.head.repo.clone_url + " " + response.head.ref;
    branch = 'gpr/' + prNumber

    switch(args[2]) {
      case '-i':
        console.log('\n' + response.title, '(@' + response.user.login + ')\n');
        process.exit();

      case 'pull':
        execho(pull);

      case '-d':
        execho('git checkout master');
        execho('git branch -d gpr/' + prNumber);
        process.exit();

      case '-D':
        execho('git checkout master');
        execho('git branch -D gpr/' + prNumber);
        process.exit();

      case '-b':
        branch = args[args.length - 2]

      default:
      execho('git checkout master');
      execho('git branch ' + branch);
      execho('git checkout gpr/' + prNumber);
      execho(pull);
    }
  });

}).on('error', function(error) {
  console.log("Error: ", error);
});
