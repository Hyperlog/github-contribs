[![Build Status](https://travis-ci.org/Hyperlog/github-contribs.svg?branch=master)](https://travis-ci.org/Hyperlog/github-contribs)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
[![codecov](https://codecov.io/gh/Hyperlog/github-contribs/branch/master/graph/badge.svg)](https://codecov.io/gh/Hyperlog/github-contribs)

[<img src="https://cdn.jsdelivr.net/gh/ghuser-io/github-contribs@45f6a0a0d6a76a49408841a26ee8d7e608b00c8c/thirdparty/octicons/repo.svg" align="left" width="64" height="64">](https://github.com/ghuser-io/github-contribs)

# github-contribs

**NOTE: This project is derivative work of (@ghuser/github-contribs)[https://github.com/ghuser-io/github-contribs]**

List **all** GitHub repos a user has contributed to **since the beginning**:

* not just the last few months,
* not just the repos owned by the user or their organisations,
* simply all repos a user has ever pushed to.

```bash
$ github-contribs AurelienLourot
✔ Fetched first day at GitHub: 2015-04-04.
⚠ Be patient. The whole process might take up to an hour... Consider using --since and/or --until
✔ Fetched all commits and PRs. Consider using --issues to fetch issues as well.
35 repo(s) found:
AurelienLourot/lsankidb
reframejs/reframe
dracula/gitk
...
```

⇒ [Advanced usage](https://github.com/ghuser-io/github-contribs/tree/master/docs/advanced.md)

## Installation

```bash
$ sudo npm install -g @ghuser/github-contribs
```

## Contributing

### To the code

To run your local changes:

```bash
$ yarn install
$ ./cli.js --help
```

## FAQ

### How does it work?

Normally in order to retrieve all repositories a user has interacted with, one should query the
[GitHub Events API](https://stackoverflow.com/a/37554614/1855917). Unfortunately it returns
[only the last 90 days](https://stackoverflow.com/a/38274468/1855917), so we don't use it.

Instead we noticed that the "Contribution Activity" section's content on the
[profile pages](https://github.com/AurelienLourot) comes from URLs like
https://github.com/AurelienLourot?from=2018-10-09 .

So we're fetching these URLs too and parsing their output.

### Why is it so slow?

We hit a [rate limit](https://en.wikipedia.org/wiki/Rate_limiting). And since it's not an official
API, we can't use a token to raise the limit.

> **NOTE**: the rate limit seems to be 40 requests / minute / endpoint / IP. Thus even if crawling a
> single user takes about 3 hours on a single machine, crawling many users in parallel on that same
> machine should still take about 3 hours.

### Isn't it likely to break?

Yes, it is since that interface isn't public. We're monitoring it<sup>[1](#footnote1)</sup> and will
react as fast as we can when it breaks.

<a name="footnote1"><sup>1</sup></a> [ghuser.io](https://github.com/ghuser-io/ghuser.io) runs
this tool every day.<br/>

### `github-contribs` missed some of my commits. Why?

`github-contribs` can only discover commits considered as
[GitHub contributions](https://help.github.com/articles/why-are-my-contributions-not-showing-up-on-my-profile/#commits),
i.e. commits that would also appear in the activity section of your GitHub profile. For example it
doesn't discover commits in forks.

## Similar/Related projects

* [GitHub-contributions](https://github.com/faheel/GitHub-contributions): uses a different
  technique. It fetches all the user's pull requests from the official API. This is clever but will
  miss the repos to which the user has pushed directly without pull request.
* [gharchive.org](https://www.gharchive.org/): records all GitHub events for all users. In theory it
  should be possible to replace our implementation by queries to this huge database.
* [@ghuser/github-contribs](https://github.com/ghuser-io/github-contribs): is inspiration for this
  project. Original is no longer maintained.
## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://hyperlog.io"><img src="https://avatars3.githubusercontent.com/u/10351046?v=4" width="100px;" alt=""/><br /><sub><b>Aditya Giri</b></sub></a><br /><a href="#infra-BrainBuzzer" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/Hyperlog/github-contribs/commits?author=BrainBuzzer" title="Tests">⚠️</a> <a href="https://github.com/Hyperlog/github-contribs/commits?author=BrainBuzzer" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!