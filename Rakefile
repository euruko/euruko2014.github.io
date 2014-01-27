require 'date'
require 'securerandom'

namespace :jekyll do
  task :post do
    date = ENV["DATE"] || Date.today.strftime('%Y-%m-%d')
    title = ENV["TITLE"] || SecureRandom.hex
    File.open("jekyll/_posts/#{date}-#{title.gsub(' ', '-')}.markdown", 'w+') do |f|
      fields = ["title: \"#{title}\""]
      ['cover', 'author', 'ava', 'post'].map do |name|
        fields << "#{name}: \"\""
      end
      fields_formatted = fields.join("\n")
      f.write("---\n#{fields_formatted}\n---")
    end
    Rake::Task["jekyll:generate"].execute
  end

  task :generate do
    system('bundle exec jekyll build --source jekyll --destination blog/data')
  end
end