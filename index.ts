import { fromEvent, Observable, of } from 'rxjs';
import { debounceTime, delay, filter, map, switchMap, tap } from 'rxjs/operators';

type resultItemType = { link: string, title: string };
const stabResults = [
    {
        link: 'https://stackblitz.com/edit/angular-gcv2ip?file=src%2Fapp%2Fapp.component.ts',
        title: 'Demo Angular 6 + Rxjs 6'
    },
    {
        link: 'https://angular.io/guide/http#error-handling',
        title: 'Angular Error handling'
    },
    {
        link: 'https://www.learnrxjs.io/operators/utility/delay.html',
        title: 'Delay for increasing durations'
    },
    {
        link: 'https://vuejs.org/',
        title: 'vue js'
    },
    {
        link: 'https://github.com/vuejs/vue',
        title: 'GitHub - vuejs/vue: Vue.js is a progressive, incrementally-adoptable'
    },
    {
        link: 'https://habr.com/ru/post/329452/',
        title: 'Vue.js для сомневающихся. Все, что нужно знать / Хабр - Habr'
    },
    {
        link: 'https://reactjs.org/',
        title: 'React – A JavaScript library for building user interfaces'
    },
    {
        link: 'React Native · A framework for building native apps using React',
        title: 'https://facebook.github.io/react-native/'
    }
];


function getInput() {
    return document.getElementById( 'search' );
}

function getEvent$( element: HTMLElement | null ): Observable<KeyboardEvent> {
    const targetEl = element ? element : document;

    return fromEvent<KeyboardEvent>( targetEl, 'keyup' ) // TODO: if user delete some symbols ?
        .pipe(
            debounceTime( 250 )
        );
}

function mapEventToStringValue( event$: Observable<KeyboardEvent> ) {
    return event$
        .pipe(
            map( ( e: KeyboardEvent ) => {
                if (e && e.target) {
                    return (e.target as HTMLInputElement).value;
                }

                return '';
            } ),
            filter( ( res: string ) => res.length >= 1 )
        );
}

function fetchResult( searchText: string ): Observable<resultItemType[]> {
    return of( stabResults ).pipe(
        map( results =>
            results.filter( item =>
                item.title.toLowerCase().indexOf( searchText ) !== -1
            )
        ),
        delay( 1000 )
    );
}

function renderSearchResults( searchResults: resultItemType[] ): void {
    const container = document.getElementById( 'resultsContainer' );

    if (container) {

        if (searchResults.length) {
            container.innerHTML = '';
            searchResults.forEach( item => {
                const newLink = createLink( item );
                container.appendChild( newLink );
            } );
            return;
        }

        container.innerHTML = '<div style="color: red">Nothing found</div>';
        return;
    }

}

function createLink( item: resultItemType ) {
    const newLink = document.createElement( 'a' );
    newLink.setAttribute( 'href', item.link );
    newLink.setAttribute( 'style', 'display: block' );
    const newText = document.createTextNode( item.title );
    newLink.appendChild( newText );
    return newLink;
}

const targetInput = getInput();
const keyboardEvent$ = getEvent$( targetInput );
const stringStream$ = mapEventToStringValue( keyboardEvent$ );

stringStream$
    .pipe(
        switchMap( searchText => fetchResult( searchText )
            .pipe(
                tap( results => renderSearchResults( results ) )
            )
        )
    )
    .subscribe();
