import { body } from "@pnp/queryable";
import {
    _SPCollection,
    _SPInstance,
    deleteable,
    spInvokableFactory,
    IDeleteable,
} from "../sharepointqueryable.js";
import { defaultPath } from "../decorators.js";
import { spPost, spPostMerge } from "../operations.js";
import { tag } from "../telemetry.js";

@defaultPath("fields")
export class _Fields extends _SPCollection<IFieldInfo[]> {

    /**
     * Creates a field based on the specified schema
     *
     * @param xml A string or XmlSchemaFieldCreationInformation instance descrbing the field to create
     */
    @tag("fs.createFieldAsXml")
    public async createFieldAsXml(xml: string | IXmlSchemaFieldCreationInformation): Promise<IFieldAddResult> {

        if (typeof xml === "string") {
            xml = { SchemaXml: xml };
        }

        const data = await spPost<{ Id: string }>(Fields(this, "createfieldasxml"), body({ parameters: xml }));

        return {
            data,
            field: this.getById(data.Id),
        };
    }

    /**
     * Gets a field from the collection by id
     *
     * @param id The Id of the list
     */
    public getById(id: string): IField {
        return tag.configure(Field(this).concat(`('${id}')`), "fs.getById");
    }

    /**
     * Gets a field from the collection by title
     *
     * @param title The case-sensitive title of the field
     */
    public getByTitle(title: string): IField {
        return tag.configure(Field(this, `getByTitle('${title}')`), "fs.getByTitle");
    }

    /**
     * Gets a field from the collection by using internal name or title
     *
     * @param name The case-sensitive internal name or title of the field
     */
    public getByInternalNameOrTitle(name: string): IField {
        return tag.configure(Field(this, `getByInternalNameOrTitle('${name}')`), "fs.getByInternalNameOrTitle");
    }

    /**
     * Adds a new field to the collection
     *
     * @param title The new field's title
     * @param properties Differ by type of field being created (see: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx)
     */
    public async add(title: string, fieldTypeKind: number, properties: IFieldCreationProperties): Promise<IFieldAddResult> {

        if (!tag.isTagged(this)) {
            tag.configure(this, "fs.add");
        }

        const data = await spPost<{ Id: string }>(Fields(this, null), body({
            Title: title,
            FieldTypeKind: fieldTypeKind,
            ...properties,
        }));

        return {
            data,
            field: this.getById(data.Id),
        };
    }

    /**
     * Adds a new SP.FieldText to the collection
     *
     * @param title The field title
     * @param properties Differ by type of field being created (see: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx)
     */
    @tag("fs.addText")
    public addText(title: string, properties?: IFieldCreationProperties & AddTextProps): Promise<IFieldAddResult> {

        return this.add(title, 2, {
            MaxLength: 255,
            ...properties,
        });
    }

    /**
     * Adds a new SP.FieldCalculated to the collection
     *
     * @param title The field title.
     * @param properties Differ by type of field being created (see: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx)
     */
    @tag("fs.addCalculated")
    public addCalculated(title: string, properties?: IFieldCreationProperties & AddCalculatedProps): Promise<IFieldAddResult> {

        return this.add(title, 17, {
            OutputType: FieldTypes.Text,
            ...properties,
        });
    }

    /**
     * Adds a new SP.FieldDateTime to the collection
     *
     * @param title The field title
     * @param properties Differ by type of field being created (see: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx)
     */
    @tag("fs.addDateTime")
    public addDateTime(title: string, properties?: IFieldCreationProperties & AddDateTimeProps): Promise<IFieldAddResult> {

        return this.add(title, 4, {
            DateTimeCalendarType: CalendarType.Gregorian,
            DisplayFormat: DateTimeFieldFormatType.DateOnly,
            FriendlyDisplayFormat: DateTimeFieldFriendlyFormatType.Unspecified,
            ...properties,
        });
    }

    /**
     * Adds a new SP.FieldNumber to the collection
     *
     * @param title The field title
     * @param properties Differ by type of field being created (see: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx)
     */
    @tag("fs.addNumber")
    public addNumber(title: string, properties?: IFieldCreationProperties & AddNumberProps): Promise<IFieldAddResult> {

        return this.add(title, 9, properties);
    }

    /**
     * Adds a new SP.FieldCurrency to the collection
     *
     * @param title The field title
     * @param properties Differ by type of field being created (see: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx)
     */
    @tag("fs.addCurrency")
    public addCurrency(title: string, properties?: IFieldCreationProperties & AddCurrencyProps): Promise<IFieldAddResult> {

        return this.add(title, 10, {
            CurrencyLocaleId: 1033,
            ...properties,
        });
    }

    /**
     * Adds a new SP.FieldMultiLineText to the collection
     *
     * @param title The field title
     * @param properties Differ by type of field being created (see: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx)
     *
     */
    @tag("fs.addMultilineText")
    public addMultilineText(title: string, properties?: IFieldCreationProperties & AddMultilineTextProps): Promise<IFieldAddResult> {

        return this.add(title, 3, {
            AllowHyperlink: true,
            AppendOnly: false,
            NumberOfLines: 6,
            RestrictedMode: false,
            RichText: true,
            ...properties,
        });
    }

    /**
     * Adds a new SP.FieldUrl to the collection
     *
     * @param title The field title
     */
    @tag("fs.addUrl")
    public addUrl(title: string, properties?: IFieldCreationProperties & AddUrlProps): Promise<IFieldAddResult> {

        return this.add(title, 11, {
            DisplayFormat: UrlFieldFormatType.Hyperlink,
            ...properties,
        });
    }

    /** Adds a user field to the colleciton
     *
     * @param title The new field's title
     * @param properties
     */
    @tag("fs.addUser")
    public addUser(title: string, properties?: IFieldCreationProperties & AddUserProps): Promise<IFieldAddResult> {

        return this.add(title, 20, {
            SelectionMode: FieldUserSelectionMode.PeopleAndGroups,
            ...properties,
        });
    }

    /**
     * Adds a SP.FieldLookup to the collection
     *
     * @param title The new field's title
     * @param properties Set of additional properties to set on the new field
     */
    @tag("fs.addLookup")
    public async addLookup(title: string, properties?: IFieldCreationProperties & AddLookupProps): Promise<IFieldAddResult> {

        return this.add(title, 7, properties);
    }

    /**
     * Adds a new SP.FieldChoice to the collection
     *
     * @param title The field title.
     * @param properties Differ by type of field being created (see: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx)
     */
    @tag("fs.addChoice")
    public addChoice(title: string, properties?: IFieldCreationProperties & AddChoiceProps): Promise<IFieldAddResult> {

        return this.add(title, 6, {
            EditFormat: ChoiceFieldFormatType.Dropdown,
            FillInChoice: false,
            ...properties,
        });
    }

    /**
     * Adds a new SP.FieldMultiChoice to the collection
     *
     * @param title The field title.
     * @param properties Differ by type of field being created (see: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx)
     */
    @tag("fs.addMultiChoice")
    public addMultiChoice(title: string, properties?: IFieldCreationProperties & AddChoiceProps): Promise<IFieldAddResult> {

        return this.add(title, 15, {
            EditFormat: ChoiceFieldFormatType.Dropdown,
            FillInChoice: false,
            ...properties,
        });
    }

    /**
   * Adds a new SP.FieldBoolean to the collection
   *
   * @param title The field title.
   * @param properties Differ by type of field being created (see: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx)
   */
    @tag("fs.addBoolean")
    public addBoolean(title: string, properties?: IFieldCreationProperties): Promise<IFieldAddResult> {

        return this.add(title, 8, properties);
    }

    /**
  * Creates a secondary (dependent) lookup field, based on the Id of the primary lookup field.
  *
  * @param displayName The display name of the new field.
  * @param primaryLookupFieldId The guid of the primary Lookup Field.
  * @param showField Which field to show from the lookup list.
  */
    @tag("fs.addDependentLookupField")
    public async addDependentLookupField(displayName: string, primaryLookupFieldId: string, showField: string): Promise<IFieldAddResult> {

        const path = `adddependentlookupfield(displayName='${displayName}', primarylookupfieldid='${primaryLookupFieldId}', showfield='${showField}')`;

        const data = await spPost(Fields(this, path));

        return {
            data,
            field: this.getById(data.Id),
        };
    }

    /**
   * Adds a new SP.FieldLocation to the collection
   *
   * @param title The field title.
   * @param properties Differ by type of field being created (see: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx)
   */
    @tag("fs.addLocation")
    public addLocation(title: string, properties?: IFieldCreationProperties): Promise<IFieldAddResult> {

        return this.add(title, 33, properties);
    }

    /**
     * Adds a new SP.FieldLocation to the collection
     *
     * @param title The field title.
     * @param properties Differ by type of field being created (see: https://msdn.microsoft.com/en-us/library/office/dn600182.aspx)
     */
    @tag("fs.addImage")
    public addImageField(title: string, properties?: IFieldCreationProperties): Promise<IFieldAddResult> {

        return this.add(title, 34, properties);
    }
}
export interface IFields extends _Fields { }
export const Fields = spInvokableFactory<IFields>(_Fields);

export class _Field extends _SPInstance<IFieldInfo> {

    public delete = deleteable("f");

    /**
   * Updates this field instance with the supplied properties
   *
   * @param properties A plain object hash of values to update for the list
   * @param fieldType The type value such as SP.FieldLookup. Optional, looked up from the field if not provided
   */
    @tag("f.update")
    public async update(properties: any, fieldType?: string): Promise<IFieldUpdateResult> {

        if (typeof fieldType === "undefined" || fieldType === null) {
            const info = await Field(this).select("FieldTypeKind")();
            fieldType = info["odata.type"];
        }

        const data = await spPostMerge(this, body(properties));

        return {
            data,
            field: <any>this,
        };
    }

    /**
   * Sets the value of the ShowInDisplayForm property for this field.
   */
    @tag("f.setShowInDisplayForm")
    public setShowInDisplayForm(show: boolean): Promise<void> {
        return spPost(Field(this, `setshowindisplayform(${show})`));
    }

    /**
   * Sets the value of the ShowInEditForm property for this field.
   */
    @tag("f.setShowInEditForm")
    public setShowInEditForm(show: boolean): Promise<void> {
        return spPost(Field(this, `setshowineditform(${show})`));
    }

    /**
   * Sets the value of the ShowInNewForm property for this field.
   */
    @tag("f.setShowInNewForm")
    public setShowInNewForm(show: boolean): Promise<void> {
        return spPost(Field(this, `setshowinnewform(${show})`));
    }
}
export interface IField extends _Field, IDeleteable { }
export const Field = spInvokableFactory<IField>(_Field);

/**
 * This interface defines the result of adding a field
 */
export interface IFieldAddResult {
    data: Partial<IFieldInfo>;
    field: IField;
}

/**
 * This interface defines the result of updating a field
 */
export interface IFieldUpdateResult {
    data: Partial<IFieldInfo>;
    field: IField;
}

export type AddTextProps = {
    MaxLength?: number;
};

export type AddCalculatedProps = {
    DateFormat?: DateTimeFieldFormatType;
    FieldTypeKind?: number;
    Formula?: string;
    OutputType?: FieldTypes;
};

export type AddDateTimeProps = {
    DateTimeCalendarType?: CalendarType;
    DisplayFormat?: DateTimeFieldFormatType;
    FriendlyDisplayFormat?: DateTimeFieldFriendlyFormatType;
};

export type AddNumberProps = {
    MinimumValue?: number;
    MaximumValue?: number;
};

export type AddCurrencyProps = AddNumberProps & {
    CurrencyLocaleId?: number;
};

export type AddMultilineTextProps = {
    AllowHyperlink?: boolean;
    AppendOnly?: boolean;
    NumberOfLines?: number;
    RestrictedMode?: boolean;
    RichText?: boolean;
};

export type AddUrlProps = {
    DisplayFormat?: UrlFieldFormatType;
};

export type AddUserProps = {
    SelectionMode?: FieldUserSelectionMode;
};

export type AddLookupProps = {
    LookupFieldName: string;
    LookupListId: string;
};

export type AddChoiceProps = {
    Choices: {
        results: string[];
    };
    EditFormat?: ChoiceFieldFormatType;
    FillInChoice?: boolean;
};



/**
 * Specifies the type of the field.
 */
export enum FieldTypes {
    Invalid = 0,
    Integer = 1,
    Text = 2,
    Note = 3,
    DateTime = 4,
    Counter = 5,
    Choice = 6,
    Lookup = 7,
    Boolean = 8,
    Number = 9,
    Currency = 10,
    URL = 11,
    Computed = 12,
    Threading = 13,
    Guid = 14,
    MultiChoice = 15,
    GridChoice = 16,
    Calculated = 17,
    File = 18,
    Attachments = 19,
    User = 20,
    Recurrence = 21,
    CrossProjectLink = 22,
    ModStat = 23,
    Error = 24,
    ContentTypeId = 25,
    PageSeparator = 26,
    ThreadIndex = 27,
    WorkflowStatus = 28,
    AllDayEvent = 29,
    WorkflowEventType = 30,
}

export enum DateTimeFieldFormatType {
    DateOnly = 0,
    DateTime = 1,
}

export enum DateTimeFieldFriendlyFormatType {
    Unspecified = 0,
    Disabled = 1,
    Relative = 2,
}

/**
 * Specifies the control settings while adding a field.
 */
export enum AddFieldOptions {
    /**
   *  Specify that a new field added to the list must also be added to the default content type in the site collection
   */
    DefaultValue = 0,
    /**
   * Specify that a new field added to the list must also be added to the default content type in the site collection.
   */
    AddToDefaultContentType = 1,
    /**
   * Specify that a new field must not be added to any other content type
   */
    AddToNoContentType = 2,
    /**
   *  Specify that a new field that is added to the specified list must also be added to all content types in the site collection
   */
    AddToAllContentTypes = 4,
    /**
   * Specify adding an internal field name hint for the purpose of avoiding possible database locking or field renaming operations
   */
    AddFieldInternalNameHint = 8,
    /**
   * Specify that a new field that is added to the specified list must also be added to the default list view
   */
    AddFieldToDefaultView = 16,
    /**
   * Specify to confirm that no other field has the same display name
   */
    AddFieldCheckDisplayName = 32,
}

export interface IXmlSchemaFieldCreationInformation {
    Options?: AddFieldOptions;
    SchemaXml: string;
}

export enum CalendarType {
    Gregorian = 1,
    Japan = 3,
    Taiwan = 4,
    Korea = 5,
    Hijri = 6,
    Thai = 7,
    Hebrew = 8,
    GregorianMEFrench = 9,
    GregorianArabic = 10,
    GregorianXLITEnglish = 11,
    GregorianXLITFrench = 12,
    KoreaJapanLunar = 14,
    ChineseLunar = 15,
    SakaEra = 16,
    UmAlQura = 23,
}

export enum UrlFieldFormatType {
    Hyperlink = 0,
    Image = 1,
}

export enum FieldUserSelectionMode {
    PeopleAndGroups = 1,
    PeopleOnly = 0,
}

export interface IFieldCreationProperties {
    DefaultFormula?: string;
    Description?: string;
    EnforceUniqueValues?: boolean;
    FieldTypeKind?: number;
    Group?: string;
    Hidden?: boolean;
    Indexed?: boolean;
    Required?: boolean;
    Title?: string;
    ValidationFormula?: string;
    ValidationMessage?: string;
}

export enum ChoiceFieldFormatType {
    Dropdown,
    RadioButtons,
}

export interface IFieldInfo {
    DefaultFormula: string | null;
    DefaultValue: string | null;
    Description: string;
    Direction: string;
    EnforceUniqueValues: boolean;
    EntityPropertyName: string;
    FieldTypeKind: FieldTypes;
    Filterable: boolean;
    FromBaseType: boolean;
    Group: string;
    Hidden: boolean;
    Id: string;
    Indexed: boolean;
    IndexStatus: number;
    InternalName: string;
    JSLink: string;
    PinnedToFiltersPane: boolean;
    ReadOnlyField: boolean;
    Required: boolean;
    SchemaXml: string;
    Scope: string;
    Sealed: boolean;
    ShowInFiltersPane: number;
    Sortable: boolean;
    StaticName: string;
    Title: string;
    TypeAsString: string;
    TypeDisplayName: string;
    TypeShortDescription: string;
    ValidationFormula: string | null;
    ValidationMessage: string | null;
}
