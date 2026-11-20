def explore_movies():
    print("\n==============================")
    print("       SELECT CATEGORY        ")
    print("==============================")
    print("1. Bollywood")
    print("2. Hollywood")
    
    cat_choice = int(input("\nChoose an option (1-2): "))
    
    if cat_choice == 1:
        print("\n--- Trending Bollywood Movies ---")
        print("1. Jawan\n2. Pathaan\n3. Gadar 2\n4. Animal\n5. Shershaah\n6. Drishyam 2\n7. Brahmastra\n8. Chhava\n9. Raid 2\n10. Sikandar")
        
        nav = input("\nDo you want to continue with Bollywood or switch to Hollywood? (C/S): ").upper()
        
        if nav == "C":
            movie = int(input("Choose a movie (1-10): "))
            if movie == 1: print("\n[Stream] Now Playing: Jawan"); return "Jawan"
            elif movie == 2: print("\n[Stream] Now Playing: Pathaan"); return "Pathaan"
            elif movie == 3: print("\n[Stream] Now Playing: Gadar 2"); return "Gadar 2"
            elif movie == 4: print("\n[Stream] Now Playing: Animal"); return "Animal"
            elif movie == 5: print("\n[Stream] Now Playing: Shershaah"); return "Shershaah"
            elif movie == 6: print("\n[Stream] Now Playing: Drishyam 2"); return "Drishyam 2"
            elif movie == 7: print("\n[Stream] Now Playing: Brahmastra"); return "Brahmastra"
            elif movie == 8: print("\n[Stream] Now Playing: Chhava"); return "Chhava"
            elif movie == 9: print("\n[Stream] Now Playing: Raid 2"); return "Raid 2"
            elif movie == 10: print("\n[Stream] Now Playing: Sikandar"); return "Sikandar"
            else: print("Invalid movie selection.")
        elif nav == "S":
            cat_choice = 2

    if cat_choice == 2:
        print("\n--- Trending Hollywood Movies ---")
        print("1. Mission Impossible\n2. Jurassic World\n3. Avatar\n4. Oppenheimer\n5. Interstellar\n6. Inception\n7. Gladiator 2\n8. Superman\n9. The Batman\n10. Avengers")
        
        nav = input("\nDo you want to continue with Hollywood or switch to Bollywood? (C/S): ").upper()
        
        if nav == "C":
            movie = int(input("Choose a movie (1-10): "))
            if movie == 1: print("\n[Stream] Now Playing: Mission Impossible"); return "Mission Impossible"
            elif movie == 2: print("\n[Stream] Now Playing: Jurassic World"); return "Jurassic World"
            elif movie == 3: print("\n[Stream] Now Playing: Avatar"); return "Avatar"
            elif movie == 4: print("\n[Stream] Now Playing: Oppenheimer"); return "Oppenheimer"
            elif movie == 5: print("\n[Stream] Now Playing: Interstellar"); return "Interstellar"
            elif movie == 6: print("\n[Stream] Now Playing: Inception"); return "Inception"
            elif movie == 7: print("\n[Stream] Now Playing: Gladiator 2"); return "Gladiator 2"
            elif movie == 8: print("\n[Stream] Now Playing: Superman"); return "Superman"
            elif movie == 9: print("\n[Stream] Now Playing: The Batman"); return "The Batman"
            elif movie == 10: print("\n[Stream] Now Playing: Avengers"); return "Avengers"
            else: print("Invalid movie selection.")
        elif nav == "S":
            print("\n--- Trending Bollywood Movies ---")
            print("1. Jawan\n2. Pathaan\n3. Gadar 2\n4. Animal\n5. Shershaah\n6. Drishyam 2\n7. Brahmastra\n8. Chhava\n9. Raid 2\n10. Sikandar")
            
            movie = int(input("Choose a movie (1-10): "))
            if movie == 1: print("\n[Stream] Now Playing: Jawan"); return "Jawan"
            elif movie == 2: print("\n[Stream] Now Playing: Pathaan"); return "Pathaan"
            elif movie == 3: print("\n[Stream] Now Playing: Gadar 2"); return "Gadar 2"
            elif movie == 4: print("\n[Stream] Now Playing: Animal"); return "Animal"
            elif movie == 5: print("\n[Stream] Now Playing: Shershaah"); return "Shershaah"
            elif movie == 6: print("\n[Stream] Now Playing: Drishyam 2"); return "Drishyam 2"
            elif movie == 7: print("\n[Stream] Now Playing: Brahmastra"); return "Brahmastra"
            elif movie == 8: print("\n[Stream] Now Playing: Chhava"); return "Chhava"
            elif movie == 9: print("\n[Stream] Now Playing: Raid 2"); return "Raid 2"
            elif movie == 10: print("\n[Stream] Now Playing: Sikandar"); return "Sikandar"
            else: print("Invalid movie selection.")
    return None