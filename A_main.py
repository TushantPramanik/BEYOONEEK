from itertools import count
from B_account_type import choose_account_type

print("============================================")
print("          WELCOME TO BEYOONEEK")
print("============================================")

user = None
p_w = None

def reg():
    global user, p_w

    print("\n|------------Register------------|")
    user = input("\n<~> Create your username: ")
    for i in count():
        p_w = input("<~> Create your password: ")
        re_p_w = input("<~> Confirm your password: ")

        if p_w == re_p_w:
            print("\n\nAccount is created. Now you can login..........")
            main()
            return
        else:
            print("\nConfirm your password carefully. Try again.........!!!!!!\n")

def log():
    if user is None and p_w is None:
        print("\nYour are not registered yet..........") 
        main()
    else:         
        print("\n|-------------Login-------------|")
        for i in count():
            uid = input("\n<~> Enter your username: ")
            if uid == user:
                for j in count():
                    p_w1 = input("<~> Enter your password: ")
                    if p_w1 == p_w:
                        print("\nThe login successfully completed...............\n")
                        choose_account_type(user)
                        return
                    else:
                        print("\nWrong password. Try again.........!!!!!!")  
            else:
                print("\nWrong username. Try again.........!!!!!!")

def main():
    print("\n1. Register")
    print("2. Login")
    print("3. Exit")

    ch = int(input("\n<~> Enter your choice: "))

    if ch == 1:
        reg() 
    elif ch == 2:
        log()    
    elif ch == 3:
        print("\nThanks for visiting beyooneek..........")
        return 
    else:
        print("\nWrong input. Try again.........!!!!!!")
        main()

main()