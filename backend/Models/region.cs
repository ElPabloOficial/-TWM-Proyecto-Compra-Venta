using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class region
{
    public int id { get; set; }

    public string nombre { get; set; } = null!;

    public int superficie { get; set; }

    public virtual ICollection<provincium> provincia { get; set; } = new List<provincium>();
}
