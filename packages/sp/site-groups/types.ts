import {
    _OLD_SharePointQueryableInstance,
    _OLD_SharePointQueryableCollection,
    OLD_spInvokableFactory,
    _SPCollection,
    spInvokableFactory,
    _SPInstance,
} from "../sharepointqueryable.js";
import { SiteUsers, ISiteUsers } from "../site-users/types.js";
import { assign, ITypedHash } from "@pnp/core";
import { metadata } from "../utils/metadata.js";
import { body } from "@pnp/queryable";
import { defaultPath } from "../decorators.js";
import { spPost, spPostMerge } from "../operations.js";
import { tag } from "../telemetry.js";

@defaultPath("sitegroups")
export class _SiteGroups extends _SPCollection<ISiteGroupInfo[]> {

    /**
     * Gets a group from the collection by id
     *
     * @param id The id of the group to retrieve
     */
    public getById(id: number): ISiteGroup {
        return tag.configure(SiteGroup(this).concat(`(${id})`), "sgs.getById");
    }

    /**
     * Adds a new group to the site collection
     *
     * @param properties The group properties object of property names and values to be set for the group
     */
    public async add(properties: ITypedHash<any>): Promise<IGroupAddResult> {

        const postBody = body(assign(metadata("SP.Group"), properties));

        const data = await spPost(tag.configure(this, "sgs.add"), postBody);

        return {
            data,
            group: this.getById(data.Id),
        };
    }

    /**
     * Gets a group from the collection by name
     *
     * @param groupName The name of the group to retrieve
     */
    public getByName(groupName: string): ISiteGroup {
        return tag.configure(SiteGroup(this, `getByName('${groupName}')`), "sgs.getByName");
    }

    /**
     * Removes the group with the specified member id from the collection
     *
     * @param id The id of the group to remove
     */
    @tag("sgs.removeById")
    public removeById(id: number): Promise<void> {
        return spPost(SiteGroups(this, `removeById('${id}')`));
    }

    /**
     * Removes the cross-site group with the specified name from the collection
     *
     * @param loginName The name of the group to remove
     */
    @tag("sgs.removeByLoginName")
    public removeByLoginName(loginName: string): Promise<any> {
        return spPost(SiteGroups(this, `removeByLoginName('${loginName}')`));
    }
}
export interface ISiteGroups extends _SiteGroups { }
export const SiteGroups = spInvokableFactory<ISiteGroups>(_SiteGroups);

export class _SiteGroup extends _SPInstance<ISiteGroupInfo> {

    /**
     * Gets the users for this group
     *
     */
    public get users(): ISiteUsers {
        return tag.configure(SiteUsers(this, "users"), "sg.users");
    }

    /**
    * @param props Group properties to update
    */
    @tag("f.update")
    public async update(props: Partial<ISiteGroupInfo>): Promise<IGroupUpdateResult> {

        const data = await spPostMerge(this, body(props));

        return {
            data,
            group: this,
        };
    }

    /**
     * Set the owner of a group using a user id
     * @param userId the id of the user that will be set as the owner of the current group
     */
    @tag("sg.setUserAsOwner")
    public setUserAsOwner(userId: number): Promise<any> {
        return spPost(SiteGroup(this, `SetUserAsOwner(${userId})`));
    }
}
export interface ISiteGroup extends _SiteGroup { }
export const SiteGroup = spInvokableFactory<ISiteGroup>(_SiteGroup);

/**
 * Result from updating a group
 *
 */
export interface IGroupUpdateResult {
    group: ISiteGroup;
    data: any;
}

/**
 * Results from adding a group
 *
 */
export interface IGroupAddResult {
    group: ISiteGroup;
    data: any;
}

export interface ISiteGroupInfo {
    AllowMembersEditMembership: boolean;
    AllowRequestToJoinLeave: boolean;
    AutoAcceptRequestToJoinLeave: boolean;
    Description: string;
    Id: number;
    IsHiddenInUI: boolean;
    LoginName: string;
    OnlyAllowMembersViewMembership: boolean;
    OwnerTitle: string;
    PrincipalType: number;
    RequestToJoinLeaveEmailSetting: string | null;
    Title: string;
}
