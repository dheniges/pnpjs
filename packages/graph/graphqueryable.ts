import { isArray } from "@pnp/core";
import { IInvokable, InjectHeaders, JSONParse, Queryable, queryableFactory } from "@pnp/queryable";
import { AsPaged, IPagedResult } from "./behaviors/paged.js";

export type GraphInit = string | IGraphQueryable | [IGraphQueryable, string];

export interface IGraphQueryableConstructor<T> {
    new(base: GraphInit, path?: string): T;
}

export type IGraphInvokableFactory<R extends IGraphQueryable> = (base: GraphInit, path?: string) => R & IInvokable;

export const graphInvokableFactory = <R extends IGraphQueryable>(f: any): IGraphInvokableFactory<R> => {
    return queryableFactory<R>(f);
};

/**
 * Queryable Base Class
 *
 */
export class _GraphQueryable<GetType = any> extends Queryable<GetType> {

    protected parentUrl: string;

    /**
     * Creates a new instance of the Queryable class
     *
     * @constructor
     * @param base A string or Queryable that should form the base part of the url
     *
     */
    constructor(base: GraphInit, path?: string) {

        super(base, path);

        if (typeof base === "string") {

            this.parentUrl = base;

        } else if (isArray(base)) {

            this.parentUrl = base[0].toUrl();

        } else {

            this.parentUrl = base.toUrl();
        }
    }

    /**
     * Choose which fields to return
     *
     * @param selects One or more fields to return
     */
    public select(...selects: string[]): this {
        if (selects.length > 0) {
            this.query.set("$select", selects.map(encodeURIComponent).join(","));
        }
        return this;
    }

    /**
     * Expands fields such as lookups to get additional data
     *
     * @param expands The Fields for which to expand the values
     */
    public expand(...expands: string[]): this {
        if (expands.length > 0) {
            this.query.set("$expand", expands.map(encodeURIComponent).join(","));
        }
        return this;
    }

    /**
     * Gets the full url with query information
     *
     */
    public toUrlAndQuery(): string {

        let url = this.toUrl();

        if (this.query.size > 0) {
            const char = url.indexOf("?") > -1 ? "&" : "?";
            url += `${char}${Array.from(this.query).map((v: [string, string]) => v[0] + "=" + v[1]).join("&")}`;
        }

        return url;
    }

    /**
     * Gets a parent for this instance as specified
     *
     * @param factory The contructor for the class to create
     */
    protected getParent<T extends _GraphQueryable>(
        factory: IGraphQueryableConstructor<T>,
        base: GraphInit = this.parentUrl,
        path?: string): T {

        return new factory(base, path);
    }
}

export interface IGraphQueryable<GetType = any> extends _GraphQueryable<GetType> { }
export const GraphQueryable = graphInvokableFactory<IGraphQueryable>(_GraphQueryable);

/**
 * Represents a REST collection which can be filtered, paged, and selected
 *
 */
export class _GraphQueryableCollection<GetType = any[]> extends _GraphQueryable<GetType> {

    /**
     *
     * @param filter The string representing the filter query
     */
    public filter(filter: string): this {
        this.query.set("$filter", filter);
        return this;
    }

    /**
     * Orders based on the supplied fields
     *
     * @param orderby The name of the field on which to sort
     * @param ascending If false DESC is appended, otherwise ASC (default)
     */
    public orderBy(orderBy: string, ascending = true): this {
        const o = "$orderby";
        const query = this.query.get(o)?.split(",") || [];
        query.push(`${encodeURIComponent(orderBy)} ${ascending ? "asc" : "desc"}`);
        this.query.set(o, query.join(","));
        return this;
    }

    /**
     * Limits the query to only return the specified number of items
     *
     * @param top The query row limit
     */
    public top(top: number): this {
        this.query.set("$top", top.toString());
        return this;
    }

    /**
     * Skips a set number of items in the return set
     *
     * @param num Number of items to skip
     */
    public skip(num: number): this {
        this.query.set("$skip", num.toString());
        return this;
    }

    /**
     * 	To request second and subsequent pages of Graph data
     */
    public skipToken(token: string): this {
        this.query.set("$skiptoken", token);
        return this;
    }

    /**
     * 	Retrieves the total count of matching resources
     */
    public async count(): Promise<number> {
        const q = GraphQueryableCollection(this).using(InjectHeaders({ "ConsistencyLevel": "eventual" }), JSONParse());
        q.query.set("$count", "true");
        const r = await q.top(1)();
        return parseFloat(r["@odata.count"]);
    }

    /**
     * Allows reading through a collection as pages of information whose size is determined by top or the api method's default
     *
     * @returns an object containing results, the ability to determine if there are more results, and request the next page of results
     */
    public paged(): Promise<IPagedResult> {
        return AsPaged(this)();
    }
}
export interface IGraphQueryableCollection<GetType = any[]> extends _GraphQueryableCollection<GetType> { }
export const GraphQueryableCollection = graphInvokableFactory<IGraphQueryableCollection>(_GraphQueryableCollection);

export class _GraphQueryableSearchableCollection<GetType = any[]> extends _GraphQueryableCollection<GetType> {

    /**
     * 	To request second and subsequent pages of Graph data
     */
    public search(query: string): IGraphQueryableSearchableCollection {
        const q = GraphQueryableSearchableCollection(this).using(InjectHeaders({ "ConsistencyLevel": "eventual" }));
        q.query.set("$search", query);
        return q;
    }
}

export interface IGraphQueryableSearchableCollection<GetType = any> extends IInvokable, IGraphQueryable<GetType> {
    search(query: string): this;
}
export const GraphQueryableSearchableCollection = graphInvokableFactory<IGraphQueryableSearchableCollection>(_GraphQueryableSearchableCollection);


/**
 * Represents an instance that can be selected
 *
 */
export class _GraphQueryableInstance<GetType = any> extends _GraphQueryable<GetType> { }

export interface IGraphQueryableInstance<GetType = any> extends IInvokable, IGraphQueryable<GetType> { }
export const GraphQueryableInstance = graphInvokableFactory<IGraphQueryableInstance>(_GraphQueryableInstance);
