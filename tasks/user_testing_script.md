# GooseHint: User Testing Script

## Objective
Create a script to test new features with real users.

## Tasks
1. **Test Cases**:
   | Task                                  | Steps                                                                 | Success Criteria                     | Notes                  |
   |---------------------------------------|-----------------------------------------------------------------------|--------------------------------------|------------------------|
   | Sign Up                               | 1. Click "Sign In". 2. Choose email/Google. 3. Complete signup.      | User lands on profile page.          | Test on mobile/desktop.|
   | Plan a Trip with Charging Stops       | 1. Enter start/end. 2. Click "Plan Trip". 3. Verify stops.          | Route + stops displayed.            | Use Lahore → Islamabad. |
   | Switch to Urdu                        | 1. Click language switcher. 2. Verify translations.                  | All UI in Urdu.                      | Check RTL layout.      |
   | Save Favorite EV                      | 1. Browse EVs. 2. Click "Save". 3. Check profile.                     | EV appears in favorites.             | Requires login.        |
   | Premium Subscription                   | 1. Go to Pricing. 2. Click "Upgrade". 3. Complete Stripe checkout.   | Redirects to success URL.           | Use test card.         |

2. **Feedback Questions**:
   - What was the most confusing part of the trip planner?
   - Did the Urdu translation feel natural?
   - Would you pay PKR 500/month for premium features? Why/why not?

3. **Tools**:
   - Use Hotjar for session recordings.
   - Use a Google Form for structured feedback.

## Expected Output
- A `USER_TESTING_SCRIPT.md` file with step-by-step instructions.
- A Google Form template for feedback.
- Summary of user pain points and suggestions.

## Notes
- Test on both mobile and desktop.
- Include users with varying tech proficiency.
