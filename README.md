## git-pull-request [![npm version](https://badge.fury.io/js/git-pull-request.svg)](https://badge.fury.io/js/git-pull-request)

A node based cli utility to pull a remote branch based on a github PR number

### Installation

npm install -g git-pull-request

### Usage

```
gpr [-i | -l | -p | -b [name] | -d | -D | -h | -v ] <pr#>

By default, gpr will fetch the remote branch for <pr#> and checkout on a detached HEAD.

[-i | info] <pr#>               Show the PR title and requestor for <pr#>.
[-p | pull] <pr#>               Pull the remote branch for <pr#> to the current branch.
[-b | branch] [name] <pr#>      Create new branch [name] from master and pull. Defaults to 'gpr/<pr#>'.
[-d | delete] <pr#>             Delete the gpr/<pr#> branch.
[-D | Delete] <pr#>             Force delete the gpr/<pr#> branch.
[-l | ls | list] [-r | remote]  List local gpr branches. / List 30 most recent open PRs.
[-n] [user:branch]              Fetch from the named ref and checkout on a detached HEAD.

[-v | version]                  Show git-pull-request version.
[-h | help]                     This help.

<pr#>                           PR number to apply the command to. 
 ```
