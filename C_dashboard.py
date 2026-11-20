from itertools import count
import D_trending
import E_explore
import F_continue_watching

history_tracking = "None"

def dash(username, plan_name):
    global history_tracking
    
    for i in count():
        print("\n=======================================================================")
        print(f"|| BEYOONEEK DASHBOARD | WELCOME {username.upper()} | ACCOUNT: {plan_name.upper()} ||")
        print("=======================================================================")
        print("\n1. CONTINUE WATCHING")
        print("2. TRENDING NOW")
        print("3. EXPLORE CATEGORIES")
        print("4. LOGOUT")
        
        choice = int(input("\nSelect an action (1-4): "))
        
        watched = None
        
        if choice == 1:
            F_continue_watching.view_continue(history_tracking)
            continue  
        elif choice == 2:
            watched = D_trending.trend()
        elif choice == 3:
            watched = E_explore.explore_movies()
        elif choice == 4:
            print("\nLogging out....")
            break
        else:
            print("Invalid input. Try again.")
            continue

        if watched is not None:
            history_tracking = watched 
            
            print("\n" + "="*45)
            print("1. Return back to Dashboard Menu")
            print("2. Exit OTT Platform entirely")
            print("="*45)
            post_choice = int(input("Select an action (1-2): "))
            
            if post_choice == 2:
                print("\nThank you for streaming on BEYOONEEK. Goodbye!")
                exit()