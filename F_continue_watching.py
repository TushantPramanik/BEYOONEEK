def view_continue(last_watched):
    print("\n----------------------------------------")
    print("         CONTINUE WATCHING")
    print("----------------------------------------")
    
    if last_watched == "None":
        print("No movies seen yet! Go play a movie from Trending or Explore first.")
    else:
        print(f"1. Resume stream: {last_watched}")
        print("2. Back to Dashboard")
        
        choice = int(input("\nSelect an option (1-2): "))
        if choice == 1:
            print(f"\n[Stream] Resuming: >>> {last_watched} <<< instantly!")
            
            print("\n" + "="*45)
            print("1. Return back to Dashboard Menu")
            print("2. Exit OTT Platform entirely")
            print("="*45)
            post_choice = int(input("Select an action (1-2): "))
            if post_choice == 2:
                print("\nThank you for streaming on BEYOONEEK. Goodbye!")
                exit()
        else:
            return