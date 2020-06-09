'use strict';

(() => {
  const PromisePool = require('es6-promise-pool');
  const fetch = require('fetch-retry');
  const htmlparser = require('htmlparser');
  const moment = require('moment');

  const fetchContribs = async (
    user,
    since,
    until,
    ora,
    console,
    alsoIssues
  ) => {
    ora =
      ora ||
      (() => {
        return {
          start() {
            return this;
          },
          stop() { },
          succeed() { },
          warn() { }
        };
      });
    console = console || {
      log: () => { }
    };

    const joinDate = await getFirstDayAtGithub(user, ora);
    const result = await getContribs(
      user,
      joinDate,
      since,
      until,
      ora,
      console,
      alsoIssues
    );
    return result;
  };

  // See https://stackoverflow.com/a/28431880/1855917
  const stringToDate = string => {

    return new Date(`${string.slice(0, 10)}T00:00:00Z`);
  };

  const dateToString = date => {
    return date.toISOString().slice(0, 10);
  };

  // See https://stackoverflow.com/a/25114400/1855917
  const previousDay = date => {
    return new Date(date.getTime() - (24 * 60 * 60 * 1000));
  };

  module.exports = {
    fetch: fetchContribs,
    stringToDate,
    dateToString,
    previousDay
  };

  const fetchRetry = url => {
    const tooManyRequests = 429;
    return fetch(url, {
      retryOn: [tooManyRequests],
      retries: 300
    });
  };

  const getFirstDayAtGithub = async (user, ora) => {
    let urlSuffix = '';
    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
      console.log('GitHub API key found.');
      urlSuffix = `?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`;
    }

    const firstDaySpinner = ora('Fetching first day at GitHub...').start();

    let error = false;
    let userInfoJson;
    try {
      const userInfo = await fetchRetry(
        `https://api.github.com/users/${user}${urlSuffix}`
      );
      userInfoJson = await userInfo.json();
    } catch {
      // This error handling should be the least verbose possible in order not to leak the API key
      // by just having the URL printed.
      error = true;
    }

    if (error || !userInfoJson.created_at) {
      firstDaySpinner.stop();
      throw new Error('Failed to fetch first day at GitHub.');
    }

    const result = stringToDate(userInfoJson.created_at);
    firstDaySpinner.succeed(
      `Fetched first day at GitHub: ${dateToString(result)}.`
    );
    return result;
  };

  const getContribs = async (
    user,
    joinDate,
    since,
    until,
    ora,
    console,
    alsoIssues
  ) => {
    const bigHtmlToRepos = (html, type) => {
      // type: 'issues', 'pull' or 'commits'
      const repos = new Set();

      const charAfterType = type === 'commits' ? '?' : '/';
      const regex = new RegExp(
        `<a.*href="/(.*)/(.*)/${type}${charAfterType}`,
        'g'
      );
      let linkToIssue;
      while ((linkToIssue = regex.exec(html))) {
        const owner = linkToIssue[1];
        const name = linkToIssue[2];
        repos.add(`${owner}/${name}`);
      }

      return repos;
    };

    const progressMessage = (
      isDone,
      alsoIssues,
      numberOfQueriedDays,
      numberOfDaysToQuery
    ) => {
      let result = (isDone && 'Fetched') || 'Fetching';
      result += ' all commits';
      result += (alsoIssues && ', PRs and issues') || ' and PRs';

      if (isDone) {
        result += '.';
      } else if (numberOfQueriedDays && numberOfDaysToQuery) {
        result += ` [${numberOfQueriedDays}/${numberOfDaysToQuery}]`;
      } else {
        result += '...';
      }

      if (!alsoIssues) {
        result += ' Consider using --issues to fetch issues as well.';
      }

      return result;
    };

    let oldestDate = joinDate;

    if (since) {
      oldestDate = new Date(Math.max(oldestDate, stringToDate(since)));
    }

    const today = stringToDate(dateToString(new Date())); // get rid of hh:mm:ss.mmmm
    let newestDate = today;

    if (until) {
      newestDate = new Date(Math.min(newestDate, stringToDate(until)));
    }

    const getContribsOnOneDay = (() => {
      let currDate = newestDate;
      let numberOfQueriedDays = 0;
      return () => {
        if (currDate < oldestDate) {
          return null;
        }

        const currDateString = dateToString(currDate);

        currDate = previousDay(currDate);

        return (async () => {
          const bigHtml = await (
            await fetchRetry(`https://github.com/${user}?from=${currDateString}`)
          ).text();
          const commitsRepos = bigHtmlToRepos(bigHtml, 'commits');
          const prsRepos = bigHtmlToRepos(bigHtml, 'pull');
          const issuesRepos = alsoIssues ?
            bigHtmlToRepos(bigHtml, 'issues') :
            [];

          progressSpinner.stop(); // temporary stop for logging

          for (const repo of commitsRepos) {
            console.log(`${currDateString}: (commits)    ${repo}`);
            result.add(repo);
          }

          for (const repo of prsRepos) {
            console.log(`${currDateString}: (PRs)        ${repo}`);
            result.add(repo);
          }

          for (const repo of issuesRepos) {
            console.log(`${currDateString}: (issues)     ${repo}`);
            result.add(repo);
          }

          progressSpinner.start(
            progressMessage(false, alsoIssues, ++numberOfQueriedDays, numberOfDaysToQuery)
          );
        })();
      };
    })();

    const numberOfDaysToQuery =
      (newestDate - oldestDate) / ((24 * 60 * 60 * 1000) + 1);

    const durationMsToQueryADay = 3500;
    let warning = `Be patient. The whole process might take up to ${moment
      .duration(numberOfDaysToQuery * durationMsToQueryADay)
      .humanize()}...`;

    if (!since && !until) {
      warning += ' Consider using --since and/or --until';
    }

    ora(warning).warn();

    const result = new Set();

    const progressSpinner = ora(progressMessage(false, alsoIssues)).start();
    await new PromisePool(getContribsOnOneDay, 5).start();
    progressSpinner.succeed(progressMessage(true, alsoIssues));
    return result;
  };
})();
