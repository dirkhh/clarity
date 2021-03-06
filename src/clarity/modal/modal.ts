import {
    Component,
    Input,
    Output,
    EventEmitter,
    HostListener,
    OnChanges,
    OnDestroy,
    SimpleChange,
    trigger
} from "@angular/core";
import {ScrollingService} from "../main/scrolling-service";
import {fadeSlide} from "../animations/fade-slide/index";
import {fade} from "../animations/fade/index";

@Component({
    selector: "clr-modal",
    viewProviders: [ScrollingService],
    templateUrl: "./modal.html",
    styles: [`
        :host { display: inline-block; }
    `],
    animations: [
        trigger("fadeDown", fadeSlide("down")),
        trigger("fade", fade(0.85))
    ]

})
export class Modal implements OnChanges, OnDestroy {
    // We grab animated children from the view, to wait for them to finish animating out
    // before completely hiding the component itself.
    @Input("clrModalOpen") _open: boolean = false;
    @Output("clrModalOpenChange") _openChanged: EventEmitter<boolean> = new EventEmitter<boolean>(false);

    @Input("clrModalClosable") closable: boolean = true;
    @Input("clrModalSize") size: string;
    @Input("clrModalStaticBackdrop") staticBackdrop: boolean = false;

    constructor(private _scrollingService: ScrollingService) {
    }

    get sizeClass(): string {
        if (this.size) {
            return "modal-" + this.size;
        } else {
            return "";
        }
    }

    //Detect when _open is set to true and set no-scrolling to true
    ngOnChanges(changes: {[propName: string]: SimpleChange}): void {
        if (changes && changes.hasOwnProperty("_open")) {
            if (changes["_open"].currentValue) {
                this._scrollingService.stopScrolling();
            } else {
                this._scrollingService.resumeScrolling();
            }
        }
    }

    ngOnDestroy(): void {
        this._scrollingService.resumeScrolling();
    }

    open(): void {
        if (this._open) {
            return;
        }
        this._open = true;
        this._openChanged.emit(true);
    }

    close(): void {
        if (!this.closable || this._open === false) {
            return;
        }
        this._open = false;
        this._openChanged.emit(false);
    }

    // FIXME: When Angular offers key filtering on global events, this should be replaced by:
    //  @HostListener("body:keyup.escape")"
    // on the close() method.
    @HostListener("body:keyup", ["$event.keyCode"])
    globalKeyUp(keyCode: number): void {
        // Close when the user presses escape
        if (this._open && keyCode === 27) {
            this.close();
        }
    }
}