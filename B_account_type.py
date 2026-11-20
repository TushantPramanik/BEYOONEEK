from itertools import count
from C_dashboard import dash

def choose_account_type(username):
    print("\n============================================")
    print("       SELECT YOUR SUBSCRIPTION PLAN    ")
    print("============================================")
    print("1. Free Plan      -> $0   (Standard quality, with ads)")
    print("2. Silver Plan    -> $10   (HD quality, 1 screen)")
    print("3. Gold Plan      -> $15  (Full HD quality, 2 screens)")
    print("4. Platinum Plan  -> $20  (4K Ultra HD, 4 screens)")
   
    choice = int(input("\nEnter your choice: "))
    
    if choice == 1:
        plan_name = "Free Plan"
        price = 0
    elif choice == 2:
        plan_name = "Silver Plan"
        price = 10
    elif choice == 3:
        plan_name = "Gold Plan"
        price = 15
    elif choice == 4:
        plan_name = "Platinum Plan"
        price = 20
    else:
        print("Invalid choice. Try again.......!!!!!")
        return choose_account_type(username)
        
    if price > 0:
        print("\n--- SIMULATED PURCHASE PORTAL ---")
        print(f"You selected the {plan_name}.")
        print(f"Total Amount Due: ${price}")
        for i in count():
            confirm = input("Proceed to pay? (yes/no): ").lower()
            
            if confirm == "yes":
                print("\nProcessing payment...")
                print(f"Payment of ${price} successful!")
                print(f"Your account has been upgraded to {plan_name}!")
                dash(username, plan_name)
                return
            elif confirm == "no":
                print("Payment cancelled. Defaulting to Free Plan.")
                dash(username, "Free Plan") 
                return
            else:
                print("Invalid input. Try again.")
    else:
        print("\nWelcome! You are now using the Free Plan.")
        dash(username, "Free Plan")