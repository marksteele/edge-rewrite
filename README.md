# Edge-rewrite - a rewrite engine running in Lambda@Edge

This project aims to provide a mechanism for running URI/URL rewriting capabilities leveraging Lambda@Edge.

In the case where you are deploying your website behind CloudFront, you can now rewrite URLs at the CDN edge and avoid wasted CPU cycles on your backend servers.

# Rule format

The rule format is similar to the format used by mod_rewrite.

```
<REGEX> <OPTIONAL REPLACEMENT> [<FLAGS>]
```

The first part of a rule is a regular expression, followed by an optional new path or URL and optional flags.

The regular expression match can contain capturing parenthesis and the capture groups can be used in the replacement expression.

The regular expression can be negated by adding an exclamation mark (!) in front of the expression.

The replacement value is used the specify the new URI or URL to return. If a dash is used as the replacement value, no replacement will take place. This can be used in conjunction with the last flag to stop processing rules.

Flags can be used to change the behaviour of the rewrite rules.

The following flags are available:

`L`: This indicates that if this rule matches, no further rules should be applied.
`NC`: When evaluating the regular expression, ignore case.
`R`: The redirect flag. Defaults to a 301 redirect, although a different code can be specified by adding the code to the flag with an equal sign (eg: R=302).
`F`: The forbidden flag. Will return a 403 error message.
`G`: The gone flag, will return a 410 error message.
`H=<host regex>`: This rule will match a regular expression against the host HTTP header.

Unless short-circuited with the last flag, all rules are tested, with the last rule that matches determining the final outcome.

Sample rules:

```
^/oldpath/(\\d*)/(.*)$ /newpath/$2/$1 [L]
!^/oldpath.*$ http://www.example.com [R=302,L,NC]
^/topsecret.*$ [F,L]
^/deadlink.*$ [G]
^/foo$ /bar [H=^baz\.com$]
```

# Operation

Rules are packaged into a JSON file that should be placed at the root of this project in a file named `rules.json`.

These will be bundled inside the lambda during the deployment process.


# Deployment

```
sls deploy -s prod --region us-east-1
```
Once the function is deployed, it can be associated to a CloudFront behaviour by specifying the versioned ARN to the behavior.

This function is designed to run on the `viewer request` phase of Lambda@Edge.


# Acknoledgements

Based on https://github.com/tinganho/connect-modrewrite/blob/master/index.js
