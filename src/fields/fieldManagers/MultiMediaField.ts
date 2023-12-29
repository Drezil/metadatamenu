import MetadataMenu from "main";
import { ButtonComponent, DropdownComponent, TFile, TextComponent, ToggleComponent } from "obsidian";
import { FieldType } from "src/types/fieldTypes";
import Field from "../Field";
import AbstractFileBasedField from "./AbstractFileBasedField";
import { getLink } from "src/utils/parser";
import { ExistingField } from "../ExistingField";
import ObjectModal from "src/modals/fields/ObjectModal";
import ObjectListModal from "src/modals/fields/ObjectListModal";
import MediaFileModal from "src/modals/fields/MediaFileModal";
import { SettingLocation } from "../FieldManager";
import FieldSettingsModal from "src/settings/FieldSettingsModal";
import { FolderSuggest } from "src/suggester/FolderSuggester";
import { MultiMediaFileModal } from "src/modals/fields/MultiMediaFileModal";
import { filesDisplay } from "./MediaField";

export default class MediaField extends AbstractFileBasedField<MultiMediaFileModal> {

    public foldersInputComponents: Array<TextComponent> = []

    constructor(plugin: MetadataMenu, field: Field) {
        super(plugin, field, FieldType.MultiMedia)
        this.field.options.folders = this.field.options.folders || []
    }

    public modalFactory(
        plugin: MetadataMenu,
        file: TFile,
        field: Field,
        eF?: ExistingField,
        indexedPath?: string,
        lineNumber: number = -1,
        asList: boolean = false,
        asBlockquote: boolean = false,
        previousModal?: ObjectModal | ObjectListModal
    ): MultiMediaFileModal {
        return new MultiMediaFileModal(plugin, file, field, eF, indexedPath, lineNumber, asList, asBlockquote, previousModal);
    }

    public getFiles = (): TFile[] => {
        return this.plugin.app.vault.getFiles().filter(f => !["md", "canvas"].includes(f.extension))
    }

    static buildLink(plugin: MetadataMenu, sourceFile: TFile, destPath: string, thumbnailSize: string | undefined) {
        const destFile = plugin.app.vault.getAbstractFileByPath(destPath)
        if (destFile instanceof TFile) {
            const link = plugin.app.fileManager.generateMarkdownLink(destFile, sourceFile.path, undefined, thumbnailSize)
            console.log(link)
            return link
        }
        return ""
    }

    public displayValue(container: HTMLDivElement, file: TFile, value: any, onClicked: () => {}): void {
        const link = getLink(value, file)
        if (link?.path) {
            const linkText = link.path.split("/").last() || ""
            const linkEl = container.createEl('a', { text: linkText.replace(/(.*).md/, "$1") });
            linkEl.onclick = () => {
                this.plugin.app.workspace.openLinkText(link.path, file.path, true)
                onClicked();
            }
        } else {
            container.createDiv({ text: value });
        }
        container.createDiv();
    }

    public createFoldersPathContainer(container: HTMLDivElement) {

    }

    private createAddButton(valuesList: HTMLDivElement, valuesListBody: HTMLDivElement): void {
        const valuesListFooter = valuesList.createDiv();
        const addValue = valuesListFooter.createEl('button');
        addValue.type = 'button';
        addValue.textContent = 'Add a value';
        addValue.onClickEvent(async (evt: MouseEvent) => {
            evt.preventDefault();
            const newKeyNumber = (this.field.options.folders || []).length + 1;
            this.field.options.folders[newKeyNumber] = "";
            this.foldersInputComponents.push(this.createFolderContainer(valuesListBody, newKeyNumber))
        });
        valuesList.createEl("hr");
    }

    private createFolderContainer(parentNode: HTMLDivElement, key: number): TextComponent {
        const values = this.field.options.folders || {};
        const presetFolder = values[key];
        console.log(key, presetFolder)
        const valueContainer = parentNode.createDiv({ cls: 'field-container', });
        const input = new TextComponent(valueContainer);
        input.inputEl.addClass("full-width");
        input.setValue(presetFolder);
        input.onChange(value => {
            this.field.options.folders[key] = value;
            FieldSettingsModal.removeValidationError(input);
        });
        new FolderSuggest(
            this.plugin,
            input.inputEl
        )
        const valueRemoveButton = new ButtonComponent(valueContainer);
        valueRemoveButton.setIcon("trash")
            .onClick((evt: MouseEvent) => {
                evt.preventDefault();
                FieldSettingsModal.removeValidationError(input);
                this.field.options.folders = this.field.options.folders.filter((f: string) => f !== input.getValue())
                parentNode.removeChild(valueContainer);
                this.foldersInputComponents.remove(input);
            });
        return input;
    };

    private createFoldersListContainer(parentContainer: HTMLDivElement): HTMLDivElement {
        const presetFoldersFields = parentContainer.createDiv()
        const foldersList = presetFoldersFields.createDiv();
        const foldersListContainer = foldersList.createDiv();
        this.field.options.folders?.forEach((folder: string, index: number) => {
            this.foldersInputComponents.push(this.createFolderContainer(foldersListContainer, index));
        });
        this.createAddButton(foldersList, foldersListContainer)
        return presetFoldersFields;
    }

    public createEmbedTogglerContainer(container: HTMLDivElement) {
        const togglerContainer = container.createDiv({ cls: "field-container" })
        togglerContainer.createDiv({ cls: "label", text: "Inline thumbnail embedded" })
        togglerContainer.createDiv({ cls: "spacer" })
        new ToggleComponent(togglerContainer)
            .setValue(this.field.options.embed)
            .onChange((value) => this.field.options.embed = value)
    }

    public createFilesDisplaySelectorContainer(container: HTMLDivElement) {
        const filesDisplaySelectorContainer = container.createDiv({ cls: "field-container" })
        filesDisplaySelectorContainer.createDiv({ cls: "label", text: "File suggest modal display" })
        filesDisplaySelectorContainer.createDiv({ cls: "spacer" })
        new DropdownComponent(filesDisplaySelectorContainer)
            .addOptions(filesDisplay)
            .setValue(this.field.options.display || "list")
            .onChange((value) => this.field.options.display = value)
    }

    public createThumbnailSizeInputContainer(container: HTMLDivElement) {
        const thumbnailSizeInputContainer = container.createDiv({ cls: "field-container" })
        thumbnailSizeInputContainer.createDiv({ cls: "label", text: "Inline embedded thumbnail height (px): " })
        thumbnailSizeInputContainer.createDiv({ cls: "spacer" })
        new TextComponent(thumbnailSizeInputContainer)
            .setValue(this.field.options.thumbnailSize)
            .onChange((value) => {
                if (!value) this.field.options.thumbnailSize = ""
                else if (isNaN(parseInt(value))) this.field.options.thumbnailSize = "20"
                else this.field.options.thumbnailSize = value
            })
    }

    public createSettingContainer(container: HTMLDivElement, plugin: MetadataMenu, location?: SettingLocation | undefined): void {
        this.createFoldersListContainer(container)
        this.createEmbedTogglerContainer(container)
        this.createFilesDisplaySelectorContainer(container)
        this.createThumbnailSizeInputContainer(container)
        super.createCustomSortingContainer(container)
    }
}
