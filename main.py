import json
from selenium.webdriver.support.ui import WebDriverWait
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
import os, shutil
import time
import sys
from config import (gecko_path)
import warnings
import requests
import urllib.request
from os import listdir
from os.path import isfile, join
import datetime
warnings.filterwarnings("ignore", category=DeprecationWarning)


def openBrowser():
    ''' open browser for scraping '''
    firefox_options = Options()
    firefox_options.add_argument("--headless")
    desired = DesiredCapabilities.FIREFOX
    desired['marionette'] = False
    firefox_profile = webdriver.FirefoxProfile() 
    #firefox_profile.set_preference("browser.privatebrowsing.autostart", True)

    driver = webdriver.Firefox(desired_capabilities=desired,
                executable_path=gecko_path,
                service_log_path=os.devnull,
                options=firefox_options,
                firefox_profile=firefox_profile)
    driver.delete_all_cookies()
    return driver


def printProgressBar (iteration, total, prefix = '', suffix = '', decimals = 1, length = 100, fill = '█', printEnd = "\r"):
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filledLength = int(length * iteration // total)
    bar = fill * filledLength + '-' * (length - filledLength)
    print(f'\r{prefix} |{bar}| {percent}% {suffix}', end = printEnd)
    # Print New Line on Complete
    if iteration == total: 
        print()

def scrap(driver):
    driver.get("https://public.healthatlasireland.ie/rsa2/index.html")
    with open('inject.js', 'r') as inject_js:
        driver.execute_script(inject_js.read())
    
    running=True
    time.sleep(3)
    while running:
        
        status=driver.execute_script("return [window.scraper.box.length,window.scraper.process_count,window.scraper.datas.length]")
        printProgressBar(status[1],status[0], prefix = 'Progress:', suffix = 'Data Found: '+str(status[2]-1), length = 100)
        
        if status[0] == status[1]:
            running=False
        time.sleep(1)
    
    print("Removing Duplicates")
    with open('duplicate.js', 'r') as inject_js:
        datas=driver.execute_script(inject_js.read())
    
    print("Found Total "+str(len(datas)-1)+" data")
    
    ti = str(datetime.datetime.now()).replace(":",".")
    f=open('Output/Report'+ti+'.csv','w')
    for x in datas:
      print(",".join([str(i) for i in x]), file=f)
    f.close()
    
    print("Saved "+'Output/Report'+ti+'.csv')
        
def main():
    driver=openBrowser()
    scrap(driver)
    
if __name__ == '__main__':
    main()