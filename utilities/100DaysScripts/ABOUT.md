# Instagram Scraper for 100 Days Gallery in YORB

*not sure where best to put this readme and the corresponding files, so for now keeping most of it in utilities while the module is in /js and the scrapes/resizes are in assets/images/100Days*

### To-Do: Deploy
- [ ] Update path in cron tab line
- [ ] install instagram-scraper (python)
- [ ] add cron tab line to YORB machine (check time of classes)
- [ ] add accounts to accounts.txt
- [ ] add assets folder since in .gitignore
- [X] create YORBOT account
- [ ] follow class
- [ ] send email to classes about permissions vis a vis bot follow
- [ ] .env for insta account + password?
- [ ] which parts need to be in .gitignore? issue if trying to run before anything in scrapes?

### To-Do: Develop
- [X] resize script (images)
- [ ] resize script (videos) (ffmpeg?)
- [X] resize script to account for rect posts (contain)
- [ ] make sure there's a valid post to display
- [ ] generate box geometry that fits the posts
- [ ] cull scraped posts older than Jan 1 in resize
- [ ] smaller avatars/zig zag gallery?
- [ ] try bigger resolution
- [ ] try diff file types
- [ ] filter by hashtag
- [X] 100Days module
- [X] YORB test
- [ ] nameplate above canvas
- [ ] sort by class in YORB not resize?
- [ ] click/interact to change day or go through multiple posts
- [ ] need to separate students by class?
- [ ] have HD images/videos served on command from other server like the projectDatabase
- [ ] *optional* would be cool to have some sort of structure outside that gets bigger with each post

## Order of Operations

1. Daily cron job that runs the scraper
2. Resize the scraper files
3. Pull from the resized files to generate the image textures in the YORB


### Cron Job: scrape & resize

```
0 2 * * * cd /INSERT PATH HERE/YORB2020/utilities/100DaysScripts/ && sudo instagram-scraper -f accounts_kd.txt -u <yorb> -p <pass> -d ../../src/assets/images/100Days/scrapes/kd -n --filter nyudaily -t image video --latest -T {date}-{shortcode}-{urlname}

10 2 * * * cd /INSERT PATH HERE/YORB2020/utilities/100DaysScripts/ && sudo instagram-scraper -f accounts_kc.txt -u <yorb> -p <pass> -d ../../src/assets/images/100Days/scrapes/kc -n --filter nyudaily -t image video --latest -T {date}-{shortcode}-{urlname}

20 2 * * * cd /INSERT PATH HERE/YORB2020/utilities/100DaysScripts/ && sudo instagram-scraper -f accounts_paula.txt -u <yorb> -p <pass> -d ../../src/assets/images/100Days/scrapes/paula -n --filter nyudaily -t image video --latest -T {date}-{shortcode}-{urlname}

30 2 * * * cd /INSERT PATH HERE/YORB2020/utilities/100DaysScripts/ && <resize-script>
``` 
