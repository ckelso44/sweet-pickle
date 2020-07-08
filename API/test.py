import re
def myfunction() :
    print("Hello World")
    strTest = '''["Hello", "my", "world"]'''
    strTest2 = '''"Hello", "my", "world"'''
    strTest3 = "Cash P/O Credit Cash"
    print (strTest3.split())
    wordList = re.sub("[^\w]", " ",  strTest).split()
    print (wordList)
    

myfunction()