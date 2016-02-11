## git-pull-request

A node based cli utility to pull a remote branch based on a github PR number

### Installation

npm install -g git-pull-request

### Usage

``` 
 gpr [-b | -i | -D] {<pr}

 -b: Create new branch off master with gpr prefix.
 -i: Show the PR title and requestor.
 -D: Force delete the branch created.
 <pr>: PR number to pull the remote branch for. 
 ```
