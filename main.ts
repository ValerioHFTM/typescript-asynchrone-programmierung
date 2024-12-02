import fetch, { Response } from "node-fetch";
import { map, mergeMap } from "rxjs/operators";
import { get } from "./utils";
import { of } from "rxjs";

/* 
Read data from https://swapi.dev/api/people/1 (Luke Skywalker)
and dependent data from swapi to return the following object

{
    name: 'Luke Skywalker',
    height: 172,
    gender: 'male',
    homeworld: 'Tatooine',
    films: [
        {
            title: 'A New Hope',
            director: 'George Lucas',
            release_date: '1977-05-25'
        },
        ... // and all other films
    ]
}

Define an interface of the result type above and all other types as well.

*/
interface Film {
  title: string;
  director: string;
  release_date: string;
}

interface Person {
  name: string;
  height: string;
  gender: "male" | "female" | "divers";
  homeworld: string;
  films: string[];
}

export interface PersonInfo {
  name: string;
  height: string;
  gender: "male" | "female" | "divers";
  homeworld: string;
  films: Film[];
}

// Task 1: write a function using promise based fetch api
// We do this task with a promise
type PromiseBasedFunction = () => Promise<PersonInfo>;
export const getLukeSkywalkerInfo: PromiseBasedFunction = () => {
  return fetch("https://swapi.dev/api/people/1").then((response: Response) => {
    return response.json().then((person: Person) => {
      // Now we have the person data
      /*
      The response of the person data looks like this:
      (This comment is done by github copilot)
      {
        "name": "Luke Skywalker",
        "height": "172",
        "gender": "male",
        "homeworld": "https://swapi.dev/api/planets/1/",
        "films": [
          "https://swapi.dev/api/films/4/",
          "https://swapi.dev/api/films/5/",
          "https://swapi.dev/api/films/6/"
        ]
      */

      // Fetch the homeworld data
      return fetch(person.homeworld)
        .then((homeworldResponse) => homeworldResponse.json())
        .then((homeworld) => {
          // Now we have the homeworld data
          /*The response of the homeworld data looks like this:
          (This comment is done by github copilot)
          {
            "name": "Tatooine",
            "rotation_period": "23",
            "orbital_period": "304",
            "diameter": "10465",
            "climate": "arid",
            "gravity": "1 standard",
            "terrain": "desert",
            "surface_water": "1",
            "population": "200000"

          */
          // Fetch all film data in parallel
          return Promise.all(
            //promise.all to handle multiple requests
            person.films.map((filmUrl) =>
              fetch(filmUrl).then((filmResponse) => filmResponse.json())
            )
          ).then((films) => {
            // Now we have all film data
            /* The response of the film data looks like this(example of new hope):
            (This comment is done by github copilot)
            {
              "title": "A New Hope",
              "episode_id": 4,
              "opening_crawl": "It is a period of civil war.",
              "director": "George Lucas",
              "producer": "Gary Kurtz, Rick McCallum",
              "release_date": "1977-05-25",
              "characters": [
                "https://swapi.dev/api/people/1/",
                "https://swapi.dev/api/people/2/",
                "https://swapi.dev/api/people/3/",
                "https://swapi.dev/api/people/4/",
                "https://swapi.dev/api/people/5/",
                "https://swapi.dev/api/people/6/",
                "https://swapi.dev/api/people/7/",
                "https://swapi.dev/api/people/8/",
                "https://swapi.dev/api/people/9/",
                "https://swapi.dev/api/people/10/",
                "https://swapi.dev/api/people/12/",
                "https://swapi.dev/api/people/13/",
                "https://swapi.dev/api/people/14/",
                "https://swapi.dev/api/people/15/",
                "https://swapi.dev/api/people/16/",
                "https://swapi.dev/api/people/18/",
                "https://swapi.dev/api/people/19/",
                "https://swapi.dev/api/people/81/"
              ],
              "planets": [
                "https://swapi.dev/api/planets/1/",
                "https://swapi.dev/api/planets/2/",
                "https://swapi.dev/api/planets/3/"
              ],
              "starships": [
                "https://swapi.dev/api/starships/2/",
                "https://swapi.dev/api/starships/3/",
                "https://swapi.dev/api/starships/5/",
                "https://swapi.dev/api/starships/9/",
                "https://swapi.dev/api/starships/10/",
                "https://swapi.dev/api/starships/11/",
                "https://swapi.dev/api/starships/12/",
                "https://swapi.dev/api/starships/13/"
              ],
              "vehicles": [
                "https://swapi.dev/api/vehicles/4/",
                "https://swapi.dev/api/vehicles/6/",
                "https://swapi.dev/api/vehicles/7/",
            */

            // Combine all data into the final object
            return {
              name: person.name,
              height: person.height,
              gender: person.gender,
              homeworld: homeworld.name,
              films: films.map((film) => ({
                title: film.title,
                director: film.director,
                release_date: film.release_date,
                /*now we built it together. if we wanted to add more the starships in the output we would have to make another map and fetch the starships data and add it to the final object*/
              })),
            } as PersonInfo;
          });
        });
    });
  });
};
// Task 2: write a function using async and await
// see also: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-7.html
type AsyncBasedFunction = () => Promise<PersonInfo>;
export const getLukeSkywalkerInfoAsync: AsyncBasedFunction = async () => {
  //Here we are getting the informaiton about the person -> In our case it's Luke
  const response = await fetch("https://swapi.dev/api/people/1");
  const person: Person = await response.json();
  // Afterwwards we are fetching the information of Luke (person) for his homeworld (person.homeworld)
  const homeworldResponse = await fetch(person.homeworld);
  const homeworld = await homeworldResponse.json();

  // Now we contniue with the films and we map them to get the full result from the API
  const films = await Promise.all(
    person.films.map(async (filmUrl) => {
      const filmResponse = await fetch(filmUrl);
      return filmResponse.json();
    })
  );

  /* When all data is fetched we get this into a response, where we provide the person details, w get the homweorld name 
  and we map the movies to get the title, director and release date. 
  */
  return {
    name: person.name,
    height: person.height,
    gender: person.gender,
    homeworld: homeworld.name,
    films: films.map((film) => ({
      title: film.title,
      director: film.director,
      release_date: film.release_date,
    })),
  } as PersonInfo;
};

// Task 3: write a function using Observable based api
// see also: https://rxjs.dev/api/index/function/forkJoin
export const getLukeSkywalkerInfoObservable = () => {
  return get<Person>("https://swapi.dev/api/people/1").pipe(
    mergeMap((person: Person) => {
      // TODO: load other stuff and return LukeSkywalkerInfo
      return of({} as PersonInfo);
    })
  );
};