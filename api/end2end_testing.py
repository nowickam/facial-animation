from selenium import webdriver
import time
import unittest

from selenium.webdriver.common.by import By

#page_url = "http://localhost:3000/"
page_url = "http://35.246.227.57/"
PATH = "./webdrivers/linux_chrome87/chromedriver"
correct_username = '1'
correct_password = '1'

incorrect_username = 'wronguser'
incorrect_password = 'wrongpassword'

AUDIO_FILES_PATH = '/home/filip/Desktop/facial-animation/audio_files/'

wavfile = "SA1.wav"
mp3file = "SA1.mp3"
invalidfile = "obama.json"

class End2EndTests(unittest.TestCase):
    """
    Class for end2end testing that mocks user interaction
    """
    def test_login_correct(self):
        """
        Correct login provided
        """
        driver = webdriver.Chrome(PATH)
        driver.get(page_url)
        time.sleep(2)

        driver.find_element_by_id("username-form").send_keys(correct_username)
        driver.find_element_by_id("password-form").send_keys(correct_password)
        driver.find_element_by_id("login-button").click()
        time.sleep(2)
        # print(driver.current_url)
        self.assertEqual(driver.current_url,page_url+'lipsync')
        driver.close()

    def test_login_incorrect(self):
        """
        Incorrect login provided
        """
        driver = webdriver.Chrome(PATH)
        driver.get(page_url)
        time.sleep(2)

        driver.find_element_by_id("username-form").send_keys(incorrect_username)
        driver.find_element_by_id("password-form").send_keys(incorrect_password)
        driver.find_element_by_id("login-button").click()
        time.sleep(2)
        # print(driver.current_url)
        self.assertEqual(driver.current_url, page_url)
        driver.close()
    
    def test_upload_wav(self):
        """
        Wav file is uploaded
        """
        driver = webdriver.Chrome(PATH)
        driver.get(page_url)
        time.sleep(2)

        driver.find_element_by_id("username-form").send_keys(correct_username)
        driver.find_element_by_id("password-form").send_keys(correct_password)
        driver.find_element_by_id("login-button").click()
        time.sleep(2)
        # print(driver.current_url)

        driver.find_element_by_id("choose-file").send_keys(AUDIO_FILES_PATH+wavfile)
        driver.find_element_by_id("upload-button").click()
        time.sleep(5)
        chosen_file = driver.find_element_by_id("chosen-file").text
        self.assertEqual(chosen_file, wavfile)
        driver.close()

    def test_upload_mp3(self):
        """
        Mp3 file is uploaded
        """
        driver = webdriver.Chrome(PATH)
        driver.get(page_url)
        time.sleep(2)

        driver.find_element_by_id("username-form").send_keys(correct_username)
        driver.find_element_by_id("password-form").send_keys(correct_password)
        driver.find_element_by_id("login-button").click()
        time.sleep(2)
        # print(driver.current_url)

        driver.find_element_by_id("choose-file").send_keys(AUDIO_FILES_PATH+mp3file)
        driver.find_element_by_id("upload-button").click()
        time.sleep(5)
        chosen_file = driver.find_element_by_id("chosen-file").text
        self.assertEqual(chosen_file, mp3file)
        driver.close()

    def test_upload_invalid(self):
        """
        Invalid file is uploaded
        """
        driver = webdriver.Chrome(PATH)
        driver.get(page_url)
        time.sleep(2)

        driver.find_element_by_id("username-form").send_keys(correct_username)
        driver.find_element_by_id("password-form").send_keys(correct_password)
        driver.find_element_by_id("login-button").click()
        time.sleep(2)
        # print(driver.current_url)

        driver.find_element_by_id("choose-file").send_keys(AUDIO_FILES_PATH+invalidfile)
        driver.find_element_by_id("upload-button").click()
        time.sleep(5)
        chosen_file = driver.find_element_by_id("chosen-file").text
        #popup_text = driver.find_element(By.PARTIAL_LINK_TEXT,"Incorrect extension! Upload .wav and .mp3 files.").text
        popup_text = driver.find_element_by_id("popup-text").text
        self.assertEqual(popup_text, "Incorrect extension! Upload .wav and .mp3 files.")
        driver.close()

    def test_upload_no_file(self):
        """
        No file is uploaded
        """
        driver = webdriver.Chrome(PATH)
        driver.get(page_url)
        time.sleep(2)

        driver.find_element_by_id("username-form").send_keys(correct_username)
        driver.find_element_by_id("password-form").send_keys(correct_password)
        driver.find_element_by_id("login-button").click()
        time.sleep(2)
        # print(driver.current_url)

        driver.find_element_by_id("upload-button").click()
        time.sleep(5)
        chosen_file = driver.find_element_by_id("chosen-file").text
        popup_text = driver.find_element_by_id("popup-text").text
        self.assertEqual(popup_text, "Choose a file!")
        driver.close()

if __name__ == '__main__':
    unittest.main()