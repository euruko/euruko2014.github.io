module Jekyll
  module RemoveNewLinesFilter
    def remove_new_lines input
      input.gsub("\n", "")
    end
  end
end

Liquid::Template.register_filter Jekyll::RemoveNewLinesFilter
