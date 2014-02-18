module Jekyll
  module RemoveNewLinesAndDoubleQuotesFilter
    def remove_new_lines_and_double_quotes input
      input.gsub!(/\n|<\!\[CDATA\[|]]>/, "")
      input.gsub('"', "'")
    end
  end
end

Liquid::Template.register_filter Jekyll::RemoveNewLinesAndDoubleQuotesFilter
