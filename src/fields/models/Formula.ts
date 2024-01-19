import { IFieldBase, BaseOptions } from "../base/BaseField"
import { ISettingsModal } from "../base/BaseSetting"
import { Constructor, FieldType } from "../Fields"

export interface Options extends BaseOptions {
    formula: string
    autoUpdate: boolean
}

export function settingsModal(Base: Constructor<ISettingsModal>): Constructor<ISettingsModal> {
    return class FormulaSettingsModal extends Base {

    }
}

export class Base implements IFieldBase {
    type = FieldType.Formula
    tagName = "formula"
    icon = "file-code"
}