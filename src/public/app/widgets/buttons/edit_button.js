import OnClickButtonWidget from "./onclick_button.js";
import appContext from "../../components/app_context.js";
import attributeService from "../../services/attributes.js";
import protectedSessionHolder from "../../services/protected_session_holder.js";

export default class EditButton extends OnClickButtonWidget {
    isEnabled() {
        return super.isEnabled() && this.note;
    }

    constructor() {
        super();

        this.icon("bx-edit-alt")
            .title("Edit this note")
            .titlePlacement("bottom")
            .onClick(widget => {
                this.noteContext.readOnlyTemporarilyDisabled = true;

                appContext.triggerEvent('readOnlyTemporarilyDisabled', {noteContext: this.noteContext});

                this.refresh();
            });
    }

    async refreshWithNote(note) {
        if (note.isProtected && !protectedSessionHolder.isProtectedSessionAvailable()) {
            this.toggleInt(false);
        }
        else {
            // prevent flickering by assuming hidden before async operation
            this.toggleInt(false);

            // can't do this in isEnabled() since isReadOnly is async
            this.toggleInt(await this.noteContext.isReadOnly());
        }

        await super.refreshWithNote(note);
    }

    entitiesReloadedEvent({loadResults}) {
        if (loadResults.getAttributes().find(
            attr => attr.type === 'label'
                && attr.name.toLowerCase().includes("readonly")
                && attributeService.isAffecting(attr, this.note)
        )) {
            this.noteContext.readOnlyTemporarilyDisabled = false;

            this.refresh();
        }
    }

    async noteTypeMimeChangedEvent({noteId}) {
        if (this.isNote(noteId)) {
            await this.refresh();
        }
    }
}
