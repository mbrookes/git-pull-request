# git-pull-request [![npm version](https://badge.fury.io/js/git-pull-request.svg)](https://badge.fury.io/js/git-pull-request)

A node based cli utility to pull a remote branch based on a github PR number

## NB v2.x.x breaking change

`-p` is now used to push, for `pull` (`update`), use `-u`

## Installation

`npm install -g git-pull-request`

You must have [Node.js](https://nodejs.org) installed to use `gpr`.
(However, you don't need to be using node or npm for your project.)

`gpr` reads your repository information from the either the git remotes named `upstream` or `origin` (in that order),
or the `package.json` file if it is present.

If you have neither a remote called "upstream" nor "origin", nor repository url in your `package.json` file,
then you will need to configure git, or update your package.json:


```json
{
  "repository": {
    "url": "git+https://github.com/your/repository.git"
  }
}
```

## Usage

```
gpr [-i | -l [-r] | -p | -f | -b [<name>] | -n | -d | -D | -v | -h] <pr#>

By default, gpr will fetch the remote branch for <pr#> and checkout on a detached HEAD.

[-i | info] <pr#>               Show the PR title and requestor for <pr#>.
[-l | ls | list] [-r | remote]  List local gpr branches. / List 30 most recent open PRs.

[-u | update | pull] <pr#>      Pull the remote branch for <pr#> to the current branch.
[-f | force] <pr#>              Force overwrite the local branch and checkout on a detached HEAD.
[-b | branch] [<name>] <pr#>      Create new branch [name] from master and pull. Defaults to 'gpr/<pr#>'.
[-n] [user:branch]              Fetch from the named ref and checkout on a detached HEAD.

' [-p | push] <user:branch>       Push the current branch or detached HEAD to the remote branch.\n' +
' [-P | Push] <<user:branch>      Force push the current branch or detached HEAD to the remote branch.\n' +

[-d | delete] <pr#>             Delete the gpr/<pr#> branch.
[-D | Delete] <pr#>             Force delete the gpr/<pr#> branch.

[-v | version]                  Show git-pull-request version.
[-h | help]                     This help.

<pr#>                           PR number to apply the command to.
 ```

### Example usage

The simplest use case, this pulls the remote branch for PR # 123 to a detached HEAD

```sh
> grp 123

```

### Usage notes

`gpr -p <user:branch>` can also be used to create a new branch on your own repo from a detached HEAD. :tada:
