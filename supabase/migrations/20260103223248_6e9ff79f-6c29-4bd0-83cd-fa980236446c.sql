-- Add the check constraint for 1-20
ALTER TABLE nahuales ADD CONSTRAINT nahuales_index_num_check CHECK (index_num >= 1 AND index_num <= 20);