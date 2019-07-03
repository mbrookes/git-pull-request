# v2.1.0

## Fixes

- Fallback to git config if invalid package.json found (@joshwooding)

## New features

- SSH support (@joshwooding)

# v2.0.2

## Fixes

- Windows support (@joshwooding)

# v2.0.0

## Breaking change

- Rename -p (pull) to -u (update)

Before:
```sh
-gpr -p <pr#>
```

After:
```sh
+gpr -u <pr#>
```

## New features

- Add support for pushing to a named user & branch

Push:

```sh
gpr -p user:branch
```

Force push:

```sh
gpr -P user:branch
```


- Add support for non JS repos (package.json no longer required)

# v1.0.0

 - Initial release
