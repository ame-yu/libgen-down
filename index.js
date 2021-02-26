const config = require("./config.json");
const fs = require("fs");
(async () => {
    const { chromium } = require('playwright');
  
  (async () => {
    const browser = await chromium.launch({
      // headless:false
    });
    const context = await browser.newContext({
      acceptDownloads: true,
      downloadsPath: ".",
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36 Edg/88.0.705.74'
    });
    //Open new page
    const page = await context.newPage();
    for(let {name, link} of config.source){
      await page.goto(link);
      const bookEntry = await page.$$("table.c > tbody > tr")
      const maxItem = Math.min(config.maxScan || 3, bookEntry.length - 1)
      console.log(`Fetch (${maxItem}) books info from ${name ?? link}`)

      for(let i = 0; i < maxItem;i++){
        const title = await page.textContent(`table.c > tbody > tr:nth-child(${i+2}) > td:nth-child(3)`)
        const year = await page.textContent(`table.c > tbody > tr:nth-child(${i+2}) > td:nth-child(5)`)
        const size = await page.textContent(`table.c > tbody > tr:nth-child(${i+2}) > td:nth-child(8)`)
        var md5 = await page.getAttribute(`table.c > tbody > tr:nth-child(${i+2}) > td:nth-child(3) > a:last-child`, "href")
        md5 = md5.slice(-32)

        var action = ActionType.GET;
        if(config.md5log.includes(md5)){
          action = ActionType.SKIP + " Duplicate."
        }else{
          for(let term in config.filter){
            if(term === "year"){
              const rule = config.filter[term]
              const publishYear = parseInt(year)
              const [min, max] = [rule.min? parseInt(rule.min): 0, rule.max? parseInt(rule.max): 3000]
              if(publishYear < min || publishYear > max || year.trim() === ""){
                action = ActionType.SKIP + ` Excluded by ${term} filter`
                break
              }
            }
            if(term === "size"){
              const rule = config.filter[term]
              const bookSize = parseInt(size)
              const [min, max] = [rule.min? parseInt(rule.min): 0, rule.max? parseInt(rule.max): 1024]
              if(size.includes("K")) continue
              if(bookSize < min || bookSize > max){
                action = ActionType.SKIP + ` Excluded by ${term} filter`
                break
              }
            }

          }
        }
        
        console.log(`${action} ${title}|Year:${year}|Size:${size}|MD5:${md5}|`)
        if(process.argv.includes("--skip")){
          await logToConfig(md5)
          continue
        }
        if(action === ActionType.GET) await downloadBook(context, md5);
      }
      
    }
    
    await page.close();
    // ---------------------
    await context.close();
    await browser.close();
  })();
  
  })();


const ActionType = {
  GET: "[GET]",
  SKIP: "[SKIP]",
}

async function downloadBook(context, md5) {
  const page = await context.newPage();
  await page.goto(`http://library.lol/main/${md5}`);

  const downloadUrl = await page.getAttribute('text="GET"', "href");
  const fileName = decodeURI(downloadUrl.replace(/.*(=|\/)/, ""));
  console.log(`Downloading <<${fileName}>> from (${downloadUrl})`);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('text="GET"')
  ]);
  await download.saveAs("./downloads/" + fileName);
  await download.suggestedFilename(fileName);

  await download.path();
  console.log("[DONE]" + fileName)
  logToConfig(md5,new Date().toISOString() + " GET " + fileName)

  await page.close();
}

async function logToConfig(md5,msg){
  if(msg) config.log.push(msg)
  config.md5log = [...new Set([...config.md5log,md5])]
  fs.writeFileSync("config.json", JSON.stringify(config,undefined,4))
}
