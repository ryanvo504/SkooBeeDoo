def get_user_weights():
    """
    Prompts the user to input weights for each category and returns them as a dictionary.

    Returns:
    - dict: A dictionary containing the weights for each category.
    """
    categories = ['Housing', 'Transportation', 'Environment', 'Health', 'Neighborhood', 'Engagement', 'Opportunity']
    weights = {}

    print("Please enter weights for each category. The weights must sum to 1.")
    
    # Loop through each category and get user input
    for category in categories:
        while True:
            try:
                weight = float(input(f"Enter weight for {category}: "))
                if weight < 0 or weight > 1:
                    print("Weight must be between 0 and 1. Please try again.")
                else:
                    weights[category] = weight
                    break
            except ValueError:
                print("Invalid input. Please enter a number.")

    # Check if the weights sum to 1
    total_weight = sum(weights.values())
    if not abs(total_weight - 1) < 1e-6:  # Allow for small floating-point inaccuracies
        print(f"Warning: The weights sum to {total_weight}, not 1. Please adjust your inputs.")
    
    return weights

# Example usage
weights = get_user_weights()
print("Weights entered by the user:", weights)