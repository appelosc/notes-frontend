## Projektbeskrivning

## Översikt

Detta är en virtuell whiteboard skapad i React där användare kan samarbeta och planera sina projekt genom att skapa olika notes (Post-it-lappar). Den kan användas för projektplanering eller brainstorming.
Projektet använder sig av två databaser samt två externa API:er.


## Arkitektur

Projektet använder sig av två externa API:er. Det ena är ett autentiserings-API med endpointsen `/auth/login` och `/auth/register`, som används för att registrera nya användare och logga in dem. En inloggad användare får en signerad `jwt-token` som skickas med i varje request för att auktorisera requests mot Notes-API:t.

Notes-API:t håller reda på boards samt notes och serverar innehåll till frontenden. Det verifierar den sparade JWT-tokenen i varje request via en `authorization header`. Tokenen används av middleware i Notes-API:t för att auktorisera varje request innan den körs. Middlewaren kollar om användaren har tillgång till en viss board och visar sedan de notes som tillhör boarden. PUT/PATCH/DELETE anropas i stil med `/notes/boardId/noteId`. POST anropas endast med `/notes`. GET anropas i stil med `/notes/boardId`.

Flödet är: Frontend -> Auth-API för JWT, sedan Frontend -> Notes-API med token.

I `src/api` finns alla API-anrop. I `client.ts` finns en generell fetch-funktion, och filen exporterar två generella fetch-anrop med base path till respektive API.

Dessa två används i `boards.ts`, `notes.ts` och `users.ts` för att definiera funktioner som gör olika anrop till sina endpoints.

`src/pages` innehåller alla sidor som användaren kan se, såsom inloggningssidan, board-sidan och note-sidan.

`src/types` innehåller interfaces för de objekt som API:erna returnerar.

## Deployment

Båda API:erna är driftsatta på CSC Rahti och körs via Docker. Secrets som JWT-secret och databas-URL är definierade i deploymentsen på CSC Rahti. Frontenden är driftsatt på `people.arcada.fi`.


## AI-användning

Jag valde att utmana mig själv och koda frontenden i React och TypeScript. Jag har ingen tidigare erfarenhet av någotdera (jag experimenterade väldigt minimalt med React under sommaren). AI har använts i frontendutvecklingen som researchpartner, i huvudsak för att hjälpa mig förstå syntaxen och komma framåt i kodandet. Tröskeln har varit ganska hög eftersom jag har börjat från grunderna när det kommer till React. Alla .ts-filer är skrivna av mig, och där har AI endast fungerat som hjälp när jag inte förstått något.

I `/pages` har jag använt mig av `Claude Code v2.1.284 Opus 5.5` för att generera en stor del av JSX-koden. Jag förstår koden som genererats, och den har genererats med tankesättet att detta INTE är en frontendkurs som fokuserar på React och TypeScript. Den genererade koden är i huvudsak boilerplate-JSX och Tailwind-styling. All kod som är genererad via kodverktyget är vattenmärkt med `----- Skriven av Claude Code Opus 5.5 -----` och `----- Slut på skriven av Claude Code Opus 5.5`.

Utan detta verktyg skulle jag inte ha hunnit skapa projektet med detta ramverk, eftersom en stor del av min tid gick åt till att förstå logiken i React och TS (saker som useState, useEffect etc.) och själva TypeScript-syntaxen.


## Personlig reflektion

Jag tycker att projektet lyckades ganska bra. Själva API-delen var inte så svår; vi gick igenom alla koncept som behövdes ordentligt på lektionerna och det gick ganska smidigt. Det jobbiga med API:erna var att visa rätt felmeddelanden och att debugga. Till exempel sorterade jag i början de notes man fick se via `author_id`, vilket senare visade sig vara ett misstag eftersom man då endast kunde se sina egna notes. Då var jag tvungen att formulera om endpointsen på nytt.

Frontenden var ganska jobbig. Jag vet inte om det var lite för ambitiöst att ta i bruk ett helt nytt ramverk och språk (även om det i princip är JS). Det gick väldigt mycket tid åt till att förstå syntaxen och hur man strukturerar ett React-projekt, eftersom allt var nytt. Jag skulle ändå säga att det var värt det, eftersom React i sig är väldigt praktiskt när man väl förstår det och kan använda sig av useState och låta React sköta renderingen osv. istället för att själv manipulera med innerHTML.
