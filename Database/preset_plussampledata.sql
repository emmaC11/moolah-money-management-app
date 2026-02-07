INSERT INTO Categories(category_name,category_type, icon, color)
VALUES ('Food & Dining', 'expense', '🍔', '#FF6B6B'),
('Transportation', 'expense', '🚗', '#4ECDC4'),
('Shopping', 'expense', '🛍️', '#FFE66D'),
('Entertainment', 'expense', '🎬', '#95E1D3'),
('Bills & Utilities', 'expense', '💡', '#F38181'),
('Healthcare', 'expense', '🏥', '#AA96DA'),
('Education', 'expense', '📚', '#FCBAD3'),
('Other', 'expense', '📦', '#A8E6CF'),
('Salary', 'income', '💰', '#51CF66'),
('Freelance', 'income', '💼', '#74C0FC'),
('Investment', 'income', '📈', '#FFD43B'),
('Gift', 'income', '🎁', '#FF8787'),
('Other', 'income', '💵', '#A8E6CF');


INSERT INTO Users (username, email, password_hash)
VALUES ('testuser', 'test@moolah.com', '$2b$10$...');

INSERT INTO Transactions (user_id, category_id, amount, description, type, date)
VALUES (1, 1, 35.50, 'Grocery shopping', 'expense', '2026-01-15'),
(1, 2, 15.00, 'Bus fare', 'expense', '2026-01-16'),
(1, 9, 2500.00, 'Monthly salary', 'income', '2026-01-01'),
(1, 4, 50.00, 'Movie tickets', 'expense', '2026-01-17');

INSERT INTO Budgets (user_id, budget_name, amount, start_date, end_date, is_active)
VALUES (1, 'January 2026', 1500.00, '2026-01-01', '2026-01-31', TRUE),
(1, 'Groceries', 500.00, '2026-01-01', '2026-01-31', TRUE);

INSERT INTO Goals (user_id, goal_name, target_amount, current_amount, target_date)
VALUES (1, 'Emergency Fund', 5000.00, 1200.00, '2026-06-30'),
(1, 'New Laptop', 1500.00, 300.00, '2026-03-31');