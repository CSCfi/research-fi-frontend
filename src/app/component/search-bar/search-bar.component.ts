import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { DataService } from '../../data.service';
import { Post } from '../../post';

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

    myControl = new FormControl();
    filteredOptions: Observable<string[]>;
    allUsers: Post[];
    autoCompleteList: any[];

    @ViewChild('autocompleteInput') autocompleteInput: ElementRef;
    @Output() onSelectedOption = new EventEmitter();

    constructor(
        private dataService: DataService
    ) { }

    ngOnInit() {

        // get all pubs
        this.dataService.getUsers().subscribe(julkaisut => {
            this.allUsers = julkaisut;
        });

        // when user types something in input, the value changes will come through this
        this.myControl.valueChanges.subscribe(userInput => {
            this.autoCompleteExpenseList(userInput);
        })
    }

    private autoCompleteExpenseList(input) {
        const categoryList = this.filterCategoryList(input);
        this.autoCompleteList = categoryList;
    }

    // this is where filtering the data happens according to you typed value
    filterCategoryList(val: string) {
        const categoryList = [];
        if (typeof val !== 'string') {
            return [];
        }
        if (val === '' || val === null) {
            return [];
        }
        return val ? this.allUsers.filter(s =>
            s.julkaisunNimi.toLowerCase().indexOf(val.toLowerCase()) !== -1 ||
            //hakee sekä nimellä että emaililla, filtering on multiple criteria
            s.julkaisunTunnus.toLowerCase().indexOf(val.toLowerCase()) !== -1)
            : this.allUsers;
    }

    // after you clicked an autosuggest option, this function will show the field you want to show in input
    displayFn(user: Post) {
        const k = user ? user.julkaisunNimi : user;
        console.log('K: ', k);
        return k;
    }

    filterUserList(event) {
        const julkaisut = event.source.value;
        if (!julkaisut) {
            this.dataService.searchOption = [];
        } else {
            this.dataService.searchOption.push(julkaisut);
            this.onSelectedOption.emit(this.dataService.searchOption);
        }
        this.focusOnPlaceInput();
    }

    removeOption(option) {
        const index = this.dataService.searchOption.indexOf(option);
        if (index >= 0) {
            this.dataService.searchOption.splice(index, 1);
            this.focusOnPlaceInput();

            this.onSelectedOption.emit(this.dataService.searchOption)
        }
    }

    // focus the input field and remove any unwanted text.
    focusOnPlaceInput() {
        this.autocompleteInput.nativeElement.focus();
        this.autocompleteInput.nativeElement.value = '';
    }


}