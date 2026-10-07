## Projekbeskrivning

## Översikt

Detta är en Virtual Whiteboard skapad i react som går ut på att anvöndare kan kollaborera och planera sina projekt genom att skapa olika notes (Post-it lappar). Kan användas för planering av projekt eller brainstorming.
Använder sig av två databaser samt två externa apin.


## Arkitektur

Projektet använder sig av 2 externa apin. En authentication api med endpointena `/auth/login` och `/auth/register` för att registrera nya användare och logga in dem. Inloggad användare får en signerad `jwt-token`som används i varje request för att auktorisera requests på Note-apin

Notes-API håller redan på board samt notes och serverar innehåll till frontenden. Den verifierar den sparade jwt-tokenen i vare request i  en `authorization header`. Den används av middleware på Notes-API för att auktorisera varje request före de körs. Kollar ifall användaren har tillgång till en viss board --> visar sedan de notes tillhördande boarden. PUT/PATCH/DELETE kallas i stil med `/notes/boardId/noteId`. POST är endast `/notes/boardId`. GET i stil med `/notes/boardId` och POST `/notes`.

Flödet är: Frontend -> AuthAPI för JWT, sedan Frontend -> notes-API med token.

## Deployment

Båda APIna är driftsatta på csc Rahti och körs via Docker. Secrets som JWT secret samt databas url är definierade i deploymentena på csc Rahti. Frontend är driftsatt på `people.arcada.fi`


## AI-användning

Jag valde att utmana mig själv och koda frontenden i React och TypeScript. Jag har ingen tidigare erfarenhet av nåndera (experimenterar med React väldigt minimalt under sommaren). AI har använts i frontend-utveckling som reasearch parter för att i huvudsak hjälpa mig förstå syntaxen och komma framåt i kodandet. Tröskeln har varit ganska stor eftersom jag börjat från grunderna när det kommer till React. Alla .ts filer är skrivna av mig och där har AI endast fungerat som hjälp när jag inte förstått något. 

I `/pages` har jag använt mig av `Claude Code v2.1.284 Opus 5.5` för att generera en stor del av JSX koden. Jag förstår den kod jag genererat och det har generetas med det tankesättet att det INTE är en frontendkurs som fokuserar på React och TypeScript. Den kod som har genererats är i huvudsak boilerplate jsx kod och tailwind styling. All kod som är genererat via kodverktyget är vattenmärkt med `----- Skriven av Claude Code Opus 5.5 -----` och `----- Slut på skriven av Claude Code Opus 5.5`. 

Utan detta verktyg skulle jag inte ha hunnit skapa detta projekt med detta ramverk eftersom en stor del av min tid for till att förstå logiken i React och ts ( saker som useState, useEffect etc) och själva TypeScript syntaxen


## Personlig Reflektion.

Jag tycker att projektet lyckades ganska bra. Själva API delen var inte så svårt, vi gick bra igenom alla koncept som behövdes på lektionen och det gick ganska bra. Det jobbiga med dem var att visa rätt felmeddelandet och att debugga. Jag hade t.ex i början så att jag sorterade de notes man fick se via `author_id` som senare visade sig vara ett misstag då man endast kunde se sina egna notes. Då måste jag börja formulera endpointena pånytt.

Frontenden var ganska jobbig. Jag vet inte om det var lite för ambitiöst att ta i bruk ett helt nytt ramverk + språk (fast det i princip är JS). Det gick väldigt mycke tid åt till att förstå syntax och hur man strukturerar ett React projekt eftersom allt var nytt. Jag skulle ändå säga att det var värt det eftersom React i sig är väldigt praktiskt när man förstår och kan använda sig av useState och ha React sköta rendering osv istället för att själv manipulera med innerHtml.