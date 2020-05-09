# Node against humanity
You can use a nodejs server to play Cards against humanity online! (self-hosted!)

## Disclaimer
I do not own Cards against humanity which is licensed under [Creative Commons BY-NC-SA 2.0 license](https://creativecommons.org/licenses/by-nc-sa/2.0/).
The english card data is taken from [crhallberg's repo](https://github.com/crhallberg/json-against-humanity) which is also licensed under [Creative Commons BY-NC-SA 2.0 license](https://creativecommons.org/licenses/by-nc-sa/2.0/). Please see [CaH FAQ](https://cardsagainsthumanity.com/#info) for more information.
The german card data is based upon [Prior99's repo](https://github.com/Prior99/cah-fullformat-german), which is licensed under [Gnu GPL](https://www.gnu.org/licenses/gpl-3.0.de.html).

# Usage
Just install [NodeJS](http://nodejs.org/) and (Git)[https://git-scm.com/].
Then open a Console (Win+R) and type 'cmd' without quotes/a Terminal (On mac in your application drawer, on linux you know it :)),
go into the directory you want to hav CaH in, and type `git clone https://github.com/colonlc/node_against_humanity.git` and Enter,
then `cd node_against_humanity` Enter, then `npm install -g yarn`, then `yarn install`, then `yarn start`. Now you have your server running!
Others can now connect to your pc with their browser under http://[your ipv4 or ipv6 address]:8080/. You connect [here](http://localhost:8080).

If you want the German cards, change 'en' to 'de' in config.json.

# Config

You can edit the config file to change
- card language "lang": values: "de", "en"
- points required to win a game: "pointsToWin": values: <Number bigger than 0>
- Idle Time in milliseconds after round "idleTime": values: <Number bigger than 0>
