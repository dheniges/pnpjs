import { body } from "@pnp/queryable";
import {
    Event as IEventType,
    Calendar as ICalendarType,
    ScheduleInformation as IScheduleInformationType,
    DateTimeTimeZone as IDateTimeTimeZoneType,
} from "@microsoft/microsoft-graph-types";
import { _GraphQueryableCollection, _GraphQueryableInstance, graphInvokableFactory } from "../graphqueryable.js";
import { defaultPath, IDeleteable, deleteable, IUpdateable, updateable, getById, IGetById } from "../decorators.js";
import { graphPost } from "../operations.js";
import { calendarView, instances } from "./funcs.js";

/**
 * Calendar
 */
export class _Calendar extends _GraphQueryableInstance<ICalendarType> {

    public calendarView = calendarView;

    public get events(): IEvents {
        return Events(this);
    }

    /**
     * Get the free/busy availability information for a collection of users,
     * distributions lists, or resources (rooms or equipment) for a specified time period.
     *
     * @param properties The set of properties used to get the schedule
     */
    public async getSchedule(properties: IGetScheduleRequest): Promise<IScheduleInformationType[]> {
        return graphPost(Calendar(this, "getSchedule"), body(properties));
    }

}
export interface ICalendar extends _Calendar { }
export const Calendar = graphInvokableFactory<ICalendar>(_Calendar);

/**
 * Calendars
 */
@defaultPath("calendars")
@getById(Calendar)
export class _Calendars extends _GraphQueryableCollection<ICalendarType[]> { }
export interface ICalendars extends _Calendars, IGetById<ICalendar> { }
export const Calendars = graphInvokableFactory<ICalendars>(_Calendars);

/**
 * Event
 */
@deleteable()
@updateable()
export class _Event extends _GraphQueryableInstance<IEventType> {
    public instances = instances;
}
export interface IEvent extends _Event, IDeleteable, IUpdateable { }
export const Event = graphInvokableFactory<IEvent>(_Event);

/**
 * Events
 */
@defaultPath("events")
@getById(Event)
export class _Events extends _GraphQueryableCollection<IEventType[]> {

    /**
     * Adds a new event to the collection
     *
     * @param properties The set of properties used to create the event
     */
    public async add(properties: IEventType): Promise<IEventAddResult> {

        const data = await graphPost(this, body(properties));

        return {
            data,
            event: (<any>this).getById(data.id),
        };
    }
}
export interface IEvents extends _Events, IGetById<IEvent> { }
export const Events = graphInvokableFactory<IEvents>(_Events);

/**
 * EventAddResult
 */
export interface IEventAddResult {
    data: IEventType;
    event: IEvent;
}

export interface IGetScheduleRequest {
    /**
     * A collection of SMTP addresses of users, distribution lists, or resources to get availability information for.
     */
    schedules: string[];
    /**
     * The date, time, and time zone that the period starts.
     */
    startTime: IDateTimeTimeZoneType;
    /**
     * The date, time, and time zone that the period ends.
     */
    endTime: IDateTimeTimeZoneType;
    /**
    * Represents the duration of a time slot in an availabilityView in the response.
    * The default is 30 minutes, minimum is 5, maximum is 1440. Optional.
    */
    availabilityViewInterval?: number;
}
