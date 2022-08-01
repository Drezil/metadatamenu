import Field from "src/fields/Field";

export interface MetadataMenuSettings {
	presetFields: Array<Field>;
	displayFieldsInContextMenu: boolean;
	globallyIgnoredFields: Array<string>;
	getFromInlineField: boolean;
	classFilesPath: string;
	isAutosuggestEnabled: boolean;
	fileClassAlias: string;
	settingsVersion?: number;
}

export const DEFAULT_SETTINGS: MetadataMenuSettings = {
	presetFields: [],
	displayFieldsInContextMenu: true,
	globallyIgnoredFields: [],
	classFilesPath: "",
	getFromInlineField: true,
	isAutosuggestEnabled: true,
	fileClassAlias: "fileClass",
	settingsVersion: undefined
};