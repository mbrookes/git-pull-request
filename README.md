## git-pull-request

A node based cli utility to pull a remote branch based on a github PR number

### Installation

npm install -g git-pull-request

### Usage

```
gpr [-i | pull | -b {branch-name} | -d | -D] {PR#}

-i    Show the PR title and requestor.
pull  Pull the remote branch for {PR#} to the current branch.
-b    Create new branch {branch-name} from master. Defaults to 'grp/{PR#}'
-d    Delete the gpr/{PR#} branch.
-D    Force delete the gpr/{PR#} branch.
{PR#} PR number to apply the command to.
 ```
