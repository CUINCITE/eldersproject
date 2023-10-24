# Huncwot Frontend Build
This project uses `sass` and `typescript`.
You can find its UML class diagram [here](https://yuml.me/gregmatys/preview/boilerplate).

## Setting up
To setup the requisite node modules just run: `npm install`.

## Compile
To compile all files to public/theme, run: `gulp`.

If you need live compiling (separately: images, fonts, typescript and scss), just run: `gulp watch`.

In case you need to test site on mobile devices, run `gulp serve`.

To compile production version, just use `gulp --release`.

## Linting
Please use linters!
Our internal configs are available on [github](https://github.com/huncwotdigital):
- styles: [config](https://github.com/huncwotdigital/css/blob/master/.scss-lint.yml)
- typescript: [config](https://github.com/huncwotdigital/typescript/blob/master/tslint.json)

## Huncwot Back-end Build
This projects uses Huncwot's UHOMVC6 framework which needs
to be symlinked to `/application/_uho` folder. Then you need
to manually create `/application_config/hosts.php` file with
mySQL credentials based on `/application_config/hosts-example.php`

## Huncwot Serdelia CMS
This projects uses Huncwot's SERDELIA6 CMS which needs
to be symlinked to `/serdeila` folder. Then you need
to manually create `/serdelia_config/hosts.php` file with
mySQL credentials based on `/serdelia_config/hosts-example.php`
