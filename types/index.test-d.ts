import { dateToString, stringToDate, previousDay, fetchContribs } from '..';
import { expectType } from 'tsd';

expectType<string>(dateToString(new Date()));
expectType<Date>(stringToDate('2020-06-09'));
expectType<Date>(previousDay(new Date()));

expectType<Promise<any>>(fetch('BrainBuzzer', '2015-09-23', '2015-09-23', 'SPINNER', console));
