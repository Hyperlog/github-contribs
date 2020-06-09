import {dateToString, stringToDate, previousDay} from '..';
import {expectType} from 'tsd';

expectType<string>(dateToString(new Date()));
expectType<Date>(stringToDate('2020-06-09'));
expectType<Date>(previousDay(new Date()));
