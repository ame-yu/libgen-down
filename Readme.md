# 📘 Libgen-down
Libgen downloader based on playwright

# ⚙ Library used
- [Playwright](http://playwright.dev/)

# ⚠ Attention
This project is for learning purposes only.

# How to use
clone this repository and enter folder.
```bash
node i playwright
node index.js
```

<details>
    <summary>config.json template</summary>

```json
{
    "name": "Libgen-down",
    "version": "1.0.0",
    "source": [
        {
            "name": "电子工业出版社",
            "link": "http://libgen.rs/search.php?&req=%E7%94%B5%E5%AD%90%E5%B7%A5%E4%B8%9A%E5%87%BA%E7%89%88%E7%A4%BE&phrase=1&view=simple&column=def&sort=id&sortmode=DESC"
        },
        {
            "name": "人民邮电出版社",
            "link": "http://libgen.rs/search.php?&req=%E4%BA%BA%E6%B0%91%E9%82%AE%E7%94%B5%E5%87%BA%E7%89%88%E7%A4%BE&phrase=1&view=simple&column=def&sort=id&sortmode=DESC"
        }
    ],
    "log": [
    ],
    "md5log": [
    ],
    "filter": {
        "year": {
            "min": "2013"
        },
        "size": {
            "max": "100M"
        }
    },
    "maxScan": 5
}
```
</details>

# Tips
- When you add source link in config, you can sort by id, then you can always get newest book added on libgen.
- This script is designed for CLI environments.If you want debug or inspect progress, just uncomment `headless:false`
# Licence
Distributed under the MIT license.