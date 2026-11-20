def trend():
    print("-" * 40)
    print("         TRENDING MOVIES")
    print("-" * 40)
    print("1. Bollywood")
    print("2. Hollywood")

    ch = int(input("\nChoose an option: "))

    # ---------------- Bollywood ----------------
    if ch == 1:
        print("\n" + "-" * 40)
        print("      TRENDING BOLLYWOOD")
        print("-" * 40)
        print("1. Dhurandhar") 
        print("2. Chhaava")
        print("3. Raid 2")
        print("4. Jaat")
        print("5. Housefull 5")
        print("6. Maalik")
        print("7. Saiyaara")
        print("8. Metro... In Dino")
        print("9. Kesari Chapter 2")
        print("10. The Diplomat")
        
        print("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
        print("[W] Watch Bollywood Movie")
        print("[S] Switch to Hollywood")

        op = (input("\nChoose(W/S): ")).upper()

        if op == "W":
            movie = int(input("Choose a movie (1-10): "))
            print("\n" + "-" * 40)
            print("         NOW PLAYING")
            print("-" * 40)

            if movie == 1: print("Movie : Dhurandhar"); return "Dhurandhar"
            elif movie == 2: print("Movie : Chhaava"); return "Chhaava"
            elif movie == 3: print("Movie : Raid 2"); return "Raid 2"
            elif movie == 4: print("Movie : Jaat"); return "Jaat"
            elif movie == 5: print("Movie : Housefull 5"); return "Housefull 5"
            elif movie == 6: print("Movie : Maalik"); return "Maalik"
            elif movie == 7: print("Movie : Saiyaara"); return "Saiyaara"
            elif movie == 8: print("Movie : Metro... In Dino"); return "Metro... In Dino"
            elif movie == 9: print("Movie : Kesari Chapter 2"); return "Kesari Chapter 2"
            elif movie == 10: print("Movie : The Diplomat"); return "The Diplomat"
            else: print("Invalid Movie.")
        elif op == "S":
            ch = 2

    # ---------------- Hollywood ----------------
    if ch == 2:
        print("\n" + "-" * 40)
        print("      TRENDING HOLLYWOOD")
        print("-" * 40)
        print("1. Mission: Impossible - The Final Reckoning")
        print("2. Jurassic World Rebirth")
        print("3. F1")
        print("4. Superman")
        print("5. How to Train Your Dragon")
        print("6. 28 Years Later")
        print("7. The Fantastic Four: First Steps")
        print("8. Thunderbolts*")
        print("9. Sinners")
        print("10. A Minecraft Movie")

        print("\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
        print("[W] Watch Hollywood Movie")
        print("[S] Switch to Bollywood")

        op = (input("\nChoose(W/S): ")).upper()

        if op == "W":
            movie = int(input("Choose a movie (1-10): "))
            print("\n" + "-" * 40)
            print("         NOW PLAYING")
            print("-" * 40)

            if movie == 1: print("Movie : Mission: Impossible - The Final Reckoning"); return "Mission: Impossible - The Final Reckoning"
            elif movie == 2: print("Movie : Jurassic World Rebirth"); return "Jurassic World Rebirth"
            elif movie == 3: print("Movie : F1"); return "F1"
            elif movie == 4: print("Movie : Superman"); return "Superman"
            elif movie == 5: print("Movie : How to Train Your Dragon"); return "How to Train Your Dragon"
            elif movie == 6: print("Movie : 28 Years Later"); return "28 Years Later"
            elif movie == 7: print("Movie : The Fantastic Four: First Steps"); return "The Fantastic Four: First Steps"
            elif movie == 8: print("Movie : Thunderbolts*"); return "Thunderbolts*"
            elif movie == 9: print("Movie : Sinners"); return "Sinners"
            elif movie == 10: print("Movie : A Minecraft Movie"); return "A Minecraft Movie"
            else: print("Invalid Movie.")
        elif op == "S":
            print("\nSwitching to Bollywood...\n")
            print("-" * 40)
            print("      TRENDING BOLLYWOOD")
            print("-" * 40)
            print("1. Dhurandhar\n2. Chhaava\n3. Raid 2\n4. Jaat\n5. Housefull 5\n6. Maalik\n7. Saiyaara\n8. Metro... In Dino\n9. Kesari Chapter 2\n10. The Diplomat")
            movie = int(input("\nChoose a movie (1-10): "))
            print("\n" + "-" * 40)
            print("         NOW PLAYING")
            print("-" * 40)

            if movie == 1: print("Movie : Dhurandhar"); return "Dhurandhar"
            elif movie == 2: print("Movie : Chhaava"); return "Chhaava"
            elif movie == 3: print("Movie : Raid 2"); return "Raid 2"
            elif movie == 4: print("Movie : Jaat"); return "Jaat"
            elif movie == 5: print("Movie : Housefull 5"); return "Housefull 5"
            elif movie == 6: print("Movie : Maalik"); return "Maalik"
            elif movie == 7: print("Movie : Saiyaara"); return "Saiyaara"
            elif movie == 8: print("Movie : Metro... In Dino"); return "Metro... In Dino"
            elif movie == 9: print("Movie : Kesari Chapter 2"); return "Kesari Chapter 2"
            elif movie == 10: print("Movie : The Diplomat"); return "The Diplomat"
            else: print("Invalid Movie.")
    return None