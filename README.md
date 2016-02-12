## git-pull-request

A node based cli utility to pull a remote branch based on a github PR number

### Installation

npm install -g git-pull-request

### Usage

```
gpr [-i | -l | -lsr | -p | -b <name> | -d | -D | -h | -v ] <pr#>

[-i | info]        Show the PR title and requestor for <pr#>.
[-l | | ls | list] List local gpr branches.
[-r | lsr]         List 30 most recent open PRs.
[-p | pull]        Pull the remote branch for <pr#> to the current branch.
[-b | branch]      Create new branch <name> from master and pull. Defaults to 'gpr/<pr#>'
[-d | delete]      Delete the gpr/<pr#> branch.
[-D | Delete]      Force delete the gpr/<pr#> branch.
[-v | version]     git-pull-request version.
[-h | help]        This help.
<pr#>              PR number to apply the command to.
 ```
