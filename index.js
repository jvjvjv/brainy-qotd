#!/usr/bin/env node

import puppeteer from "puppeteer";
import { DateTime } from "luxon";
import { existsSync, writeFile } from "fs";
import { exit } from "process";

const url = 'https://www.brainyquote.com/quote_of_the_day';
const today = DateTime.now().toString().substring(0, 10);
const filename = `quote-${today}.jpg`;
const waitOptions = {
  waitUntil: 'networkidle0',
  timeout: 60000,
};

async function run () {
  const browser = await puppeteer.launch({
    headless: true,
    args: [ '--no-sandbox' ],
    timeout: 60000,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 630
    });

    // Load page and get random quote;
    await page.goto(url, waitOptions);
    const todaysQuoteLink = await page.evaluate(`a=document.querySelectorAll('.qotd-wrapper-cntr a[href*="/quotes/"]'),b=a.length;c=Math.floor(Math.random()*b),a[c].getAttribute('href')`);

    // Go to random quote and select a random image
    await page.goto(`https://brainyquote.com/${todaysQuoteLink}`, waitOptions);
    const finalImageLink = await page.evaluate(`a=document.querySelectorAll(".quoteDetailThumbs a"),b=a.length,c=Math.floor(Math.random()*b),a[c].getAttribute('href')`);

    // Load the random image page and fetch image link
    await page.goto(`https://brainyquote.com/${finalImageLink}`, waitOptions);
    const imgSrc = await page.evaluate(`document.querySelector('.qti-listm img').getAttribute('src');`);
    const img = await page.goto(`https://brainyquote.com/${imgSrc}`);

    // Download image link
    writeFile(filename, await img.buffer(), function (err) {
      if (err) return console.log(err);
      return console.log(`File '${filename}' has left the library. File '${filename}' has been saved.`)
    })
  } catch (error) {
    console.error(error);
  }

  await browser.close();
};

if (existsSync(filename)) {
  console.log(`file "${filename}" exists already.`);
  exit(1);
}
run();
