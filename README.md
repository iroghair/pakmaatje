# Pakmaatje
Een docker-based web-interface voor gezamenlijk opstellen van inpaklijstjes, bijvoorbeeld voor vakanties of verbouwingen

## Wat is het?
Pakmaatje draait in een Docker-container en gebruikt een SQLite-database om de gegevens op te slaan. Je kunt de container starten met behulp van Docker Compose, waarna je toegang krijgt tot de webinterface via je browser. In de interface kun je lijsten aanmaken, items toevoegen en delen met anderen. Waarom? Ik heb het gebouwd omdat ik lokaal en onafhankelijk van derden, samen met de familie een inpaklijst wilde kunnen maken voor onze vakanties. Oplossingen zoals Google Docs of Notion waren te omslachtig, en hebben een account nodig. Bovendien moet het met 1 druk via pc of telefoon bereikbaar zijn als ik iets wil toevoegen zodra me iets te binnen schiet. De bedoeling is dat de container draait op een lokale NAS.

## Hoe werkt het?
Vanuit de prompt, gebruik de volgende commando's om de server lokaal te starten:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in de browser en ga aan de slag!


## Ontwikkelaars
Dit project is grotendeels gebouwd met Anti-Gravity en Claude code, met lokaal enkele persoonlijke aanpassingen. 

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
