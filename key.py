import pyautogui
keys = []

print("python ready")
while True:
    inp = input().strip()
    print("input: ", inp)
    if inp == "exit":
        for key in keys:
            pyautogui.keyUp(key)
        print("python exit")
        break
    if inp == "":
        continue
    if inp == "clear":
        for key in keys:
            pyautogui.keyUp(key)
        keys = []
    if inp[0] == "!":
        pyautogui.keyUp(inp[1:])
        print("key up: ", inp[1:])
        if inp[1:] in keys:
            keys.remove(inp[1:])
    else:
        pyautogui.keyDown(inp)
        print("key down: ", inp)
        if inp not in keys:
            keys.append(inp)